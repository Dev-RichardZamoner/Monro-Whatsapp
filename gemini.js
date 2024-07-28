require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);

async function generateText(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    try {
        const result = await model.generateContent(prompt, {
            generationConfig: {
                maxOutputTokens: 1000, // Aumente o número de tokens conforme necessário
            },
        });
        return result.response.text();
    } catch (error) {
        console.error('Error generating text:', error);
        return 'Desculpe, ocorreu um erro ao gerar a resposta.';
    }
}

async function startChat(history, msg) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Validação do histórico de chat
    const validatedHistory = history.map(entry => {
        if (!entry.parts || entry.parts.length === 0 || !entry.parts[0].text) {
            // Se não houver partes ou texto, adiciona um texto padrão
            return { ...entry, parts: [{ text: '...' }] };
        }
        return entry;
    });

    try {
        const chat = model.startChat({
            history: validatedHistory,
            generationConfig: {
                maxOutputTokens: 1000, // Aumente o número de tokens conforme necessário
            },
        });

        const result = await chat.sendMessage(msg);
        return result.response.text();
    } catch (error) {
        console.error('Error generating text:', error);
        return 'Desculpe, ocorreu um erro ao gerar a resposta.';
    }
}

module.exports = { generateText, startChat };
