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

$pulisci = function ($v) {
    $v = isset($v) ? trim((string)$v) : '';
    $v = str_replace(array("\r", "\n", "%0a", "%0d"), ' ', $v);
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
};

// Campo trappola per i bot: se compilato, fingiamo il successo.
if (!empty($_POST['website'])) {
    esci(true, '', $ajax, $PAGINA_RITORNO);
}

$nome      = $pulisci($_POST['nome'] ?? '');
$contatto  = $pulisci($_POST['contatto'] ?? '');
$servizio  = $pulisci($_POST['servizio'] ?? '');
$messaggio = trim((string)($_POST['messaggio'] ?? ''));
$messaggio = htmlspecialchars($messaggio, ENT_QUOTES, 'UTF-8');

if (mb_strlen($nome) < 2 || mb_strlen($contatto) < 5) {
    esci(false, 'Compila nome e un contatto valido.', $ajax, $PAGINA_RITORNO);
}

$corpo  = "Nuova richiesta dal sito deltagroupsrl.it\n\n";
$corpo .= "Nome: $nome\n";
$corpo .= "Telefono o e-mail: $contatto\n";
$corpo .= "Servizio: $servizio\n";
$corpo .= "Messaggio:\n" . ($messaggio !== '' ? $messaggio : '(vuoto)') . "\n\n";
$corpo .= 'Data: ' . date('d/m/Y H:i') . "\n";
$corpo .= 'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'n/d') . "\n";

$headers  = 'From: Sito Delta Group <' . $MITTENTE . '>' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
// Se il contatto è un indirizzo e-mail valido, permette la risposta diretta.
if (filter_var($contatto, FILTER_VALIDATE_EMAIL)) {
    $headers .= 'Reply-To: ' . $contatto . "\r\n";
}

$inviata = @mail($DESTINATARIO, '=?UTF-8?B?' . base64_encode($OGGETTO) . '?=', $corpo, $headers);

if ($inviata) {
    esci(true, '', $ajax, $PAGINA_RITORNO);
}
esci(false, 'Invio non riuscito. Chiamaci allo 0733 815450.', $ajax, $PAGINA_RITORNO);
