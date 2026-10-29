/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: WEBHOOK DE FEEDBACK DE QUESTÕES — ISSA ACADEMY
 * ==============================================================================
 *
 * COMO INSTALAR ESTE SCRIPT NA SUA PLANILHA GOOGLE:
 * 1. Abra o Google Drive (https://drive.google.com) e crie uma nova "Planilha Google"
 *    com o nome: "Issa Academy - Feedbacks do Simulado MSA".
 * 2. No menu superior da planilha, clique em: Extensões > Apps Script.
 * 3. Apague qualquer código existente no editor e cole todo este arquivo.
 * 4. Clique no ícone de disquete (Salvar) ou pressione Ctrl + S.
 * 5. Clique no botão azul "Implantar" (canto superior direito) > "Nova implantação".
 * 6. Na engrenagem ao lado de "Selecione o tipo", escolha "App da Web".
 * 7. Preencha as configurações:
 *    - Descrição: Webhook Simulado MSA
 *    - Executar como: "Eu (seu-email@gmail.com)"
 *    - Quem pode acessar: "Qualquer pessoa" (ou "Anyone")  <-- IMPORTANTE!
 * 8. Clique em "Implantar" e autorize as permissões da sua conta Google.
 * 9. Copie a "URL do app da Web" gerada (ex: https://script.google.com/macros/s/.../exec).
 * 10. Cole essa URL no arquivo `src/modules/simulado/utils/feedbackReporter.ts` na constante
 *     `DEFAULT_FEEDBACK_WEBHOOK_URL` ou na variável de ambiente `VITE_FEEDBACK_WEBHOOK_URL`.
 *
 * Pronto! A partir desse momento, todo reporte de questão enviado por qualquer aluno
 * cairá automaticamente como uma nova linha nesta planilha em tempo real!
 * ==============================================================================
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Corpo da requisição vazio' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Se a planilha estiver vazia, cria o cabeçalho formatado na Linha 1
    if (sheet.getLastRow() === 0) {
      var headers = [
        'Data / Hora',
        'ID da Questão',
        'Fase',
        'Período',
        'Página MSA',
        'Tópico / Item',
        'Motivo',
        'Motivo (Descrição)',
        'Observação do Aluno',
        'Enunciado da Questão'
      ];
      sheet.appendRow(headers);

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1a3c5a');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // Formata a data e hora no fuso horário do Brasil
    var dataHora = Utilities.formatDate(
      data.timestamp ? new Date(data.timestamp) : new Date(),
      'America/Sao_Paulo',
      'dd/MM/yyyy HH:mm:ss'
    );

    var motivoLabels = {
      'gabarito_duvidoso': 'Gabarito ou resposta correta duvidosa',
      'referencia_msa': 'Página ou tópico do MSA divergente',
      'erro_digitacao': 'Erro de digitação ou formatação no texto',
      'outro': 'Outra sugestão ou observação'
    };

    var motivoDescricao = motivoLabels[data.reason] || data.reason || 'N/A';

    var row = [
      dataHora,
      data.questionId || 'N/A',
      data.fase || 'N/A',
      data.periodo || 'N/A',
      data.pagina || 'N/A',
      data.item || 'N/A',
      data.reason || 'N/A',
      motivoDescricao,
      data.comment && data.comment.trim() ? data.comment.trim() : '(Sem comentário)',
      data.pergunta || 'N/A'
    ];

    sheet.appendRow(row);

    // OPCIONAL: Descomente as linhas abaixo caso queira receber um e-mail a cada reporte!
    /*
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: '📌 [Issa Academy] Novo Feedback na Questão ' + (data.questionId || ''),
      body: 'Data: ' + dataHora + '\n' +
            'Questão: ' + (data.questionId || '') + ' (Fase ' + (data.fase || '') + ')\n' +
            'Motivo: ' + motivoDescricao + '\n' +
            'Comentário do Aluno: ' + (data.comment || 'Nenhum') + '\n\n' +
            'Enunciado: ' + (data.pergunta || '')
    });
    */

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Feedback gravado com sucesso!' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'active',
      service: 'Issa Academy Feedback Webhook',
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
