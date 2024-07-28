const qrcode = require('qrcode-terminal');
const { Client, LocalAuth  } = require('whatsapp-web.js');
const { generateText, startChat } = require('./gemini');

client = new Client({
    puppeteer: {
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    authStrategy: new LocalAuth({ clientId: "client"})
});

// Adicione um manipulador de eventos para o evento 'qr'
client.on('qr', (qr) => {
    // Gere um código QR para o usuário escanear
    qrcode.generate(qr, { small: true });
});

// Adicione um manipulador de eventos para o evento 'ready'
client.on('ready', () => {
    // O cliente está pronto para uso
    console.log('O Bot está iniciando... Desenvolvido por Richard Zamoner');
});

// Inicialize as variáveis para o histórico de bate-papo e o intervalo de solicitação
let lastRequestTime = 0;
const requestInterval = 1000; // 1 segundo
let chatHistory = [];

// Adicione um manipulador de eventos para o evento 'message'
client.on('message', async (msg) => {
    // Verifique se o intervalo de solicitação foi atingido
    const currentTime = Date.now();
    if (currentTime - lastRequestTime >= requestInterval) {
        lastRequestTime = currentTime;

        // Se for a primeira mensagem, pergunte o nome do usuário
        if (chatHistory.length === 0) {
            msg.reply("Olá! 👋  Qual é o seu nome?");
            chatHistory.push({ role: "user", parts: [{ text: msg.body }] });
            chatHistory.push({ role: "model", parts: [{ text: "Olá! 👋  Qual é o seu nome?" }] });
        } else {
            // Se a mensagem começa com "Monro" ou "monro", responda normalmente
            if (msg.body.toLowerCase().includes("monro")) {
                try {
                    // Gere uma resposta usando o modelo de linguagem
                    const response = await startChat(chatHistory, msg.body.substring(6));
                    // Adicione a mensagem do usuário e a resposta ao histórico de bate-papo
                    chatHistory.push({ role: "user", parts: [{ text: msg.body }] });
                    chatHistory.push({ role: "model", parts: [{ text: response }] });
                    // Responda à mensagem do usuário
                    msg.reply(response);
                } catch (error) {
                    // Trate quaisquer erros que possam ocorrer durante a geração da resposta
                    console.error('Error generating text:', error);
                    msg.reply('Desculpe, estou enfrentando problemas técnicos no momento. Por favor, tente novamente mais tarde.');
                }
            } else {
                // Se a mensagem não começar com "Monro", verifique se é uma resposta direta
                if (msg.quotedMsg) {
                    try {
                        // Gere uma resposta usando o modelo de linguagem
                        const response = await startChat(chatHistory, msg.body);
                        // Adicione a mensagem do usuário e a resposta ao histórico de bate-papo
                        chatHistory.push({ role: "user", parts: [{ text: msg.body }] });
                        chatHistory.push({ role: "model", parts: [{ text: response }] });
                        // Responda à mensagem do usuário
                        msg.reply(response);
                    } catch (error) {
                        // Trate quaisquer erros que possam ocorrer durante a geração da resposta
                        console.error('Error generating text:', error);
                        msg.reply('Desculpe, estou enfrentando problemas técnicos no momento. Por favor, tente novamente mais tarde.');
                    }
                } else {
                    // Caso contrário, a mensagem é ignorada
                }
            }
        }
    }
});

// Inicialize o cliente
client.initialize();
