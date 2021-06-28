const { WAConnection, MessageType, Mimetype, MessageOptions } = require('@adiwajshing/baileys');
const gm = require('gm');
const fs = require('fs');

async function connectWA() {
    const conn = new WAConnection();
    await conn.connect();
    conn.on('chat-update', async (chat) => {
        // console.log(chat);
        if ((chat.messages)) {  
            try {
                const msg = chat.messages.all()[0];
                const msgType = Object.keys(msg.message)[0];
                // console.log(msg);
                // console.log(msgType);
                if(msgType === MessageType.image) {
                    // console.log(msg);
                    let stickerCommand = "!sticker"
                    if(msg.message.imageMessage.caption.startsWith(stickerCommand)) {
                        console.log("Sticker request received.");
                        conn.downloadMediaMessage(msg, "stream").then((imgStream) => {
                            gm(imgStream).resize(512, 512).background("none").gravity("Center").extent(512, 512).write('sticker.webp', async (err) => {
                                if(err) {console.log("ERROR: " + err);}
                                else {
                                    console.log("Converted sticker");
                                    // const response = await conn.sendMessage(msg.key.remoteJid, fs.readFileSync('./sticker.webp'), MessageType.sticker, {quoted:msg, mimetype:Mimetype.webp});
                                    // console.log("Message sent");
                                    conn.sendMessage(msg.key.remoteJid, fs.readFileSync('./sticker.webp'), MessageType.sticker, {quoted:msg, mimetype:Mimetype.webp}).then((response) => {
                                        console.log("Message sent");
                                        fs.unlink("./sticker.webp", (err) => {
                                            if(err) {console.log("Error in deleting sticker: " + err);}
                                        });
                                    }).catch((err) => {
                                        console.log("Error in sending sticker message: " + err);
                                    });
                                }
                            });   
                        }).catch((err) => {
                            console.log("ERROR in downloading image: " + err);
                        });
                    }
                }
            }
            catch(err) {
                console.log("ERROR: " + err);
            }
        }
    });
    console.log("done");
}

connectWA().catch((err) => {console.log("Error: " + err)});