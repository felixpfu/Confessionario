LEIA ISSO TUDO ANTES DE QUERER ROUBAR A IDEIA

TO LIGA‎DO QUE ESSE ME_LEIA CHAMOU A TUA ATENÇÃO :) 

🫥  Tá mais como funciona essa b0st@?

😑 Calma ae paizão, vamos por partes...


𝟏) Frontend (React e Vite): 

É ele que:

- Mostra a interface do site
- Renderiza a tela de introdução (splash screen, ta lá no style.css)
- Exibe a caixa para escrever a mensagem
- Mostra o feed público
- Envia as mensagens pro servidor
- Busca as mensagens já postadas

  
Quando a pessoa abre o site:

- Primeiro aparece uma animação de abertura
- Depois entra na tela principal do confessionário
- O React faz requisições para o backend usando fetch()

Vê um exemplo meu aí do que ele pede:

 GET /messages → para carregar as mensagens
 
 POST /messages → para enviar uma nova mensagem
- Ou seja: o frontend não salva porra nenhuma sozinho, ele só bate papo com o backend

------------------------------------------------

𝟐) Backend (Node.js + Express) 

É ele que:

- Recebe as confissões enviadas pelo frontend
- Valida os dados
- Define o tempo de expiração
- Salva a mensagem no banco de dados
- Devolve para o frontend as confissões que ainda não expiraram

Rotas principais:

GET /messages
Retorna apenas as mensagens que ainda estão válidas (não expiradas)

POST /messages
Recebe uma mensagem nova, com o conteúdo e o tempo de duração

O Backend também faz algumas proteções:

- Limita quantidade de posts para evitar spam
- Sanitiza o texto
- Controla tamanho máximo da mensagem (nesse caso é 999 caractéres)

------------------------------------------------

𝟑) Banco de dados (PostgreSQL)

Cada mensagem salva tem, por exemplo:

- Conteúdo da mensagem
- Data de criação
- Data de expiração

A lógica principal é:

- A mensagem entra no banco
- O backend compara a hora atual com a hora de expiração
- Se já venceu, ela não aparece mais
- Periodicamente, mensagens expiradas podem ser removidas

Então o banco guarda as mensagens, mas o backend decide quais ainda podem ser mostradas

------------------------------------------------

 Pra fazer rodar, primeiro baixe o Docker Desktop (ja que eu rodo o PostgreSQL dentro de um container, manuseio mais facil)
 
 Deixe duas janelas do Terinal (Ou no Powershell se estiver no Windows), uma pro Client e outra pro Server.

 (Já que o processo é o mesmo pros dois, vou facilitar pra você e resumir os processos)
                                                                     
 - Identifica pra mim aí onde tá o folder 'client' ou 'server' no teu Terminal/Powershell
 - Roda o comando 'npm run dev'
 - Lembre que essas aspas NÃO devem ser digitadas no Terminal/Powershell, pode dar erro   

Enfim, ele roda no localhost porque eu não tive capacidade e tempo pra lançar ao público.
Se você fazer ele rodar usando o IP da sua internet local, qualquer um concectado a sua rede pode usar o confessionário, tornando o site em um chat.

Se quiser comprar a ideia de mim ou tiver uma dúvida, me manda um email: felix@stendec.io







