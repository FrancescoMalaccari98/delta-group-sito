<?php
/**
 * Delta Group S.r.l. — invio del form contatti.
 * Richiede PHP 7.4+ con mail() attiva (hosting condiviso cPanel/Plesk: di norma è attiva).
 * Non funziona con Live Server: serve PHP. Vedi README.md.
 */

// ---------------------------------------------------------------
// CONFIGURAZIONE — da rivedere prima della pubblicazione
// ---------------------------------------------------------------
$DESTINATARIO   = 'info@delta-group.it';
$MITTENTE       = 'no-reply@delta-group.it';   // deve appartenere al dominio ospitato
$OGGETTO        = 'Richiesta dal sito — Delta Group';
$PAGINA_RITORNO = 'contatti.html';             // usata solo se JavaScript è disattivato
$MAX_INVII_ORA  = 5;                           // per indirizzo IP
// ---------------------------------------------------------------

$ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']);

function esci($ok, $messaggio, $ajax, $ritorno) {
    if ($ajax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('ok' => $ok, 'errore' => $ok ? null : $messaggio));
    } else {
        header('Location: ' . $ritorno . ($ok ? '?inviato=1' : '?errore=1'));
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    esci(false, 'Metodo non consentito.', $ajax, $PAGINA_RITORNO);
}

$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'n/d';

// ---------------------------------------------------------------
// Limite di invii per IP: evita che un bot riempia la casella.
// Il contatore sta in un file temporaneo, si azzera da solo dopo un'ora.
// ---------------------------------------------------------------
$traccia = sys_get_temp_dir() . '/dg-form-' . md5($ip) . '.txt';
$adesso  = time();
$invii   = array();
if (is_readable($traccia)) {
    $righe = @file($traccia, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (is_array($righe)) {
        foreach ($righe as $t) {
            if (ctype_digit($t) && ($adesso - (int)$t) < 3600) { $invii[] = (int)$t; }
        }
    }
}
if (count($invii) >= $MAX_INVII_ORA) {
    esci(false, 'Hai già inviato più richieste. Chiamaci allo 0733 815450: rispondiamo subito.', $ajax, $PAGINA_RITORNO);
}

// Campo trappola per i bot: se compilato, fingiamo il successo.
if (!empty($_POST['website'])) {
    esci(true, '', $ajax, $PAGINA_RITORNO);
}

// ---------------------------------------------------------------
// Pulizia. ATTENZIONE: la mail è testo semplice, quindi NON si usa
// htmlspecialchars (trasformerebbe l'apostrofo in &#039; dentro il messaggio).
// Si eliminano solo i caratteri di controllo e i ritorni a capo usati
// per l'iniezione di intestazioni.
// ---------------------------------------------------------------
$una_riga = function ($v) {
    $v = isset($v) ? (string)$v : '';
    $v = str_replace(array("\r", "\n", "%0a", "%0d", "\0"), ' ', $v);
    $v = preg_replace('/[\x00-\x1F\x7F]/u', '', $v);
    return trim(preg_replace('/\s{2,}/u', ' ', $v));
};
$piu_righe = function ($v) {
    $v = isset($v) ? (string)$v : '';
    $v = str_replace(array("\r\n", "\r"), "\n", $v);
    $v = preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/u', '', $v);
    return trim($v);
};

$nome      = $una_riga($_POST['nome'] ?? '');
$contatto  = $una_riga($_POST['contatto'] ?? '');
$servizio  = $una_riga($_POST['servizio'] ?? '');
$messaggio = $piu_righe($_POST['messaggio'] ?? '');

// Validazione: nome plausibile e un recapito che sia un telefono o un'e-mail.
$e_mail  = (bool)filter_var($contatto, FILTER_VALIDATE_EMAIL);
$e_tel   = (bool)preg_match('/^[+0-9][0-9 .\-()]{7,17}$/', $contatto);
if (mb_strlen($nome) < 2 || mb_strlen($nome) > 80 || !($e_mail || $e_tel)) {
    esci(false, 'Controlla il nome e il recapito: serve un telefono o un’e-mail valida.', $ajax, $PAGINA_RITORNO);
}
if (mb_strlen($messaggio) > 4000) {
    $messaggio = mb_substr($messaggio, 0, 4000) . "\n[messaggio troncato]";
}
$servizi_ammessi = array('GPL e metano', 'Revisione', 'Officina e diagnosi', 'Pneumatici', 'Altro');
if (!in_array($servizio, $servizi_ammessi, true)) { $servizio = 'Altro'; }

$corpo  = "Nuova richiesta dal sito delta-group.it\n";
$corpo .= str_repeat('-', 48) . "\n\n";
$corpo .= "Nome: $nome\n";
$corpo .= 'Recapito: ' . $contatto . ' (' . ($e_mail ? 'e-mail' : 'telefono') . ")\n";
$corpo .= "Servizio: $servizio\n\n";
$corpo .= "Messaggio:\n" . ($messaggio !== '' ? $messaggio : '(vuoto)') . "\n\n";
$corpo .= str_repeat('-', 48) . "\n";
$corpo .= 'Ricevuta il ' . date('d/m/Y \a\l\l\e H:i') . "\n";
$corpo .= 'IP di provenienza: ' . $ip . "\n";
if ($e_mail) {
    $corpo .= "\nPuoi rispondere direttamente a questa e-mail.\n";
} else {
    $corpo .= "\nRichiamare il numero indicato sopra.\n";
}

$headers  = 'From: Sito Delta Group <' . $MITTENTE . '>' . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
$headers .= 'X-Mailer: sito-delta-group' . "\r\n";
// Se il contatto è un indirizzo e-mail valido, permette la risposta diretta.
if ($e_mail) {
    $headers .= 'Reply-To: ' . $contatto . "\r\n";
}

$oggetto = '=?UTF-8?B?' . base64_encode($OGGETTO . ' — ' . $nome) . '?=';

// -f imposta il mittente di busta: molti hosting lo richiedono per non finire in spam.
$inviata = @mail($DESTINATARIO, $oggetto, $corpo, $headers, '-f' . $MITTENTE);

if ($inviata) {
    $invii[] = $adesso;
    @file_put_contents($traccia, implode("\n", $invii) . "\n", LOCK_EX);
    esci(true, '', $ajax, $PAGINA_RITORNO);
}
esci(false, 'Invio non riuscito. Chiamaci allo 0733 815450.', $ajax, $PAGINA_RITORNO);
