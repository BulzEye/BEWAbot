const { WAConnection, MessageType, Mimetype, MessageOptions } = require('@adiwajshing/baileys');
const gm = require('gm');
const fs = require('fs');
// const gif2webp = require ("gif2webp");

async function connectWA() {
    const conn = new WAConnection();

    // code to save authorization details
    conn.on ('open', () => {
        // save credentials whenever updated
        console.log (`credentials updated!`);
        const authInfo = conn.base64EncodedAuthInfo(); // get all the auth info we need to restore this session
        fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t')); // save this info to a file
    });
    try {
        conn.loadAuthInfo ('./auth_info.json');
    }
    catch (errN) {
        console.log("No previous session found.");
    }
    await conn.connect();
    conn.on('chat-update', async (chat) => {
        // console.log(chat);
        if ((chat.messages)) {  
            try {
                const msg = chat.messages.all()[0];
                const msgType = Object.keys(msg.message)[0];
                // console.log(msg);
                // console.log(msgType);

                if(msgType === MessageType.text || msgType === MessageType.extendedText) {
                    // console.log(msg);
                    const msgText = (msgType === MessageType.text) ? msg.message.conversation : msg.message.extendedTextMessage.text;
                    if(msgText.startsWith("!")) {
                        // console.log("triggered");
                        const cmd = msgText.split(" ")[0].substring(1);
                        let cmdContent = msgText.substring(msgText.indexOf(" ") + 1);
                        const actWord = "helloBot";
                        // console.log(cmd);
                        if(cmd === actWord) {
                            // send message
                            console.log("Received greeting");
                            const toSend = msg.key.remoteJid;
                            const response = await conn.sendMessage(toSend, "Hello, World!", MessageType.text);
                        }
                    }
                }

                // detect sticker messages
                if(msgType === MessageType.image) {
                    // console.log(msg);
                    let gifTrue = false;
                    if(msg.message.imageMessage.mimetype === Mimetype.gif) {
                        gifTrue = true;
                    }
                    let stickerCommand = "!sticker"
                    if(msg.message.imageMessage.caption.startsWith(stickerCommand)) {
                        console.log("Sticker request received.");
                        conn.downloadMediaMessage(msg, "stream").then((imgStream) => {
                            if(gifTrue) {
                                // gm(imgStream).resize(512, 512).background("none").gravity("Center").extent(512, 512).write('sticker.gif', async (err) => {
                                //     if(err) {console.log("ERROR: " + err);}
                                //     else {
                                //         gif2webp.convert({
                                //             source: fs.readFileSync("sticker.gif"),
                                //             lossy: true
                                //         }, (err, buff) => {
                                //             if(err) {
                                //                 console.log("Error in converting gif to webp: " + err);
                                //             }
                                //             else {
                                //                 fs.writeFileSync("sticker.webp", buff);
                                //             }
                                //         })
                                //         console.log("Converted animated sticker");
                                //         // const response = await conn.sendMessage(msg.key.remoteJid, fs.readFileSync('./sticker.webp'), MessageType.sticker, {quoted:msg, mimetype:Mimetype.webp});
                                //         // console.log("Message sent");
                                //         conn.sendMessage(msg.key.remoteJid, fs.readFileSync('./sticker.webp'), MessageType.sticker, {quoted:msg, mimetype:Mimetype.webp}).then((response) => {
                                //             console.log("Message sent");
                                //             fs.unlink("./sticker.webp", (err) => {
                                //                 if(err) {console.log("Error in deleting animated sticker: " + err);}
                                //             });
                                //         }).catch((err) => {
                                //             console.log("Error in sending sticker message: " + err);
                                //         });
                                //     }
                                // });  
                                conn.sendMessage(msg.key.remoteJid, "BEWAbot: GIF conversion not supported yet! Only regular images supported.").then((response) => {
                                    console.log("Animated sticker request declined as WIP");
                                })   
                            }
                            else {
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
                            }
                        }).catch((err) => {
                            console.log("ERROR in downloading image: " + err);
                        });
                    }
                }

                // Reply message detector 
                if(msgType === MessageType.extendedText) {
                    let msgText = msg.message.extendedTextMessage.text;
                    if(msgText.startsWith("!")) {
                        const cmd = msgText.split(" ")[0].substring(1);
                        let cmdContent = msgText.substring(msgText.indexOf(" ") + 1);
                        switch(cmd) {
                            case "sticker":
                                conn.sendMessage(msg.key.remoteJid, "BEWAbot: Tagged sticker requests are currently not supported! Send the image again using the command in the caption.").then((response) => {
                                    console.log("Tag sticker message received, sent WIP message.");
                                }).catch(msgSendError);
                                break;
                            
                            case "kiddoShi":
                                let taggedMsgType = Object.keys(msg.message.extendedTextMessage.contextInfo.quotedMessage)[0];
                                if(taggedMsgType === MessageType.text) {
                                    console.log("Received kiddo conversion request");
                                    let conText = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
                                    // console.log(conText);
                                    conText = conText.replace(/r/g, "l");
                                    conText = conText.replace(/j/g, "d");
                                    conText = conText.replace(/R/g, "L");
                                    conText = conText.replace(/J/g, "D");
                                    conn.sendMessage(msg.key.remoteJid, conText, MessageType.text, {quoted:msg}).then((response) => {
                                        console.log("Sent kiddo style message.");
                                    }).catch(msgSendError);
                                }
                                else {
                                    conn.sendMessage(msg.key.remoteJid, "BEWAbot: Tag a text message!").then((response) => console.log("Message rejected: Non-text message tagged")).catch(msgSendError);
                                }
                        }
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

function msgSendError(msgError) {
    console.log("ERROR in sending message: " + msgError);
} 

connectWA().catch((err) => {console.log("Error: " + err)});