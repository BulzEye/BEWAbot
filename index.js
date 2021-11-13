const { WAConnection, MessageType, Mimetype, MessageOptions } = require('@adiwajshing/baileys');
const gm = require('gm');
const fs = require('fs');
const gTTS = require("gtts")
// const gif2webp = require ("gif2webp");

async function connectWA() {
    const conn = new WAConnection();

    conn.version = [2, 2142, 12];

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

    // initialise word for !taboo command
    let tabooWord = "͸"
    fs.readFile("./txt/temp/taboowrd.txt", (err, data) => {
        if(err) {
            console.log("error reading taboo word file");
        }
        else {
            tabooWord = data.toString().trim();
        }
    });
    let tabooExempt = false;

    conn.on('chat-update', async (chat) => {
        // console.log(chat);
        if ((chat.messages)) {  
            try {
                const msg = chat.messages.all()[0];
                const msgType = Object.keys(msg.message)[0];
                // console.log(msg);
                // console.log(msgType);

                if(msg.key.fromMe && msg.status !== 2) return;

                if(msgType === MessageType.text) {
                    // console.log(msg);
                    const msgText = msg.message.conversation;
                    if(msgText.startsWith("!")) {
                        // console.log("triggered");
                        const cmd = msgText.split(" ")[0].substring(1);
                        let cmdContent = (msgText.indexOf(" ") < 0) ? "" : msgText.substring(msgText.indexOf(" ") + 1);
                        // const actWord = "helloBot";
                        // console.log(cmd);
                        // if(cmd === actWord) {
                        //     // send message
                        //     console.log("Received greeting");
                        //     const toSend = msg.key.remoteJid;
                        //     const response = await conn.sendMessage(toSend, "Hello, World!", MessageType.text);
                        // }
                        switch(cmd) {
                            case "helloBot":
                                console.log("Received greeting");
                                const response = await conn.sendMessage(msg.key.remoteJid, "Hello, World!", MessageType.text);
                                break;

                            case "cmdhelp":
                                // WIP
                                const commandList = [
                                    {
                                        name: "helloBot",
                                        description: "Simple command to get a greeting from bot (to check if bot is working, for example)."
                                    }
                                ]
                                // WIP - list of commands to be probably saved in JSON later on
                                
                                // let message = "*BEWAbot*\n\n_Commands:_\n*- !helloBot:* Simple command to get a greeting from bot (to check if bot is working, for example).\n*- !sticker:* Send a photo (currently, non-animated) with this in the caption, or tag a photo, to convert it into a sticker. This converts the image as is, so prior cropping may be required.\n*- !kiddoShi:* Converts a tagged message to a 'kiddo' style message.\n*- !kiddoShit:* Corrupted version of 'kiddoShi' that will convert existing kiddo style parts into regular speak.\n*- !toImg:* Tag a sticker (currently, non-animated) with this command to convert it into an image. (Currently, reliability is not guaranteed)\n*- !tts:* Tag a message, or insert text after this command (separated by a space after command) to generate a text-to-speech voice file.\n*- !cmdhelp:* Lists all the available commands of the bot.\n*- !vote:* Shows who one should vote for rightful CR of CSE :).";
                                // conn.sendMessage(msg.key.remoteJid, message, MessageType.text).then((response) => {
                                //     console.log("Sent commands list.");
                                // });
                                
                                fs.readFile("./txt/help.txt", (err, data) => {
                                    if(err) {console.log("error in opening file: " + err);}
                                    else {
                                        conn.sendMessage(msg.key.remoteJid, data.toString(), MessageType.text).then((res) => {
                                            console.log("Sent commands list.");
                                        }).catch(msgSendError);
                                    }
                                });
                                break;
                                
                            case "tts":
                                // console.log(cmdContent);
                                var outFile = new gTTS(cmdContent, "en");
                                outFile.save("./tmp/outFile.mp3", (err, result) => {
                                    if(err) {
                                        console.log("ERROR in converting to audio: " + err);
                                    }
                                    else {
                                        console.log("Converted to TTS");
                                        conn.sendMessage(msg.key.remoteJid, {url: "./tmp/outFile.mp3"}, MessageType.audio, {quoted:msg, mimetype: Mimetype.mp4Audio, ptt: true}).then((response) => {
                                            console.log("Message sent");
                                            fs.unlink("./tmp/outFile.mp3", (err) => {
                                                if(err) {console.log("Error in deleting tts audio file: " + err);}
                                            });
                                        }).catch(msgSendError);
                                    }
                                });
                                break;
                            
                            case "vote":
                                fs.readFile("./txt/temp/camp.txt", (err, data) => {
                                    if(err) {console.log("error in opening file: " + err);}
                                    else {
                                        conn.sendMessage(msg.key.remoteJid, data.toString(), MessageType.text, {quoted: msg}).then((res) => {
                                            console.log("Sent campaign message.");
                                        }).catch(msgSendError);
                                    }
                                });
                                break;

                            case "rng":
                                // console.log("Command content: \"" + cmdContent + "\"");
                                if(cmdContent.trim()) {
                                    let stEnd = cmdContent.split(" ");
                                    stEnd.push("text");
                                    let start = Number(stEnd[0]);
                                    let end = Number(stEnd[1]);
                                    if((isNaN(end) && isNaN(start)) || (isNaN(start) && !isNaN(end))) {
                                        conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Invalid options!", MessageType.text, {quoted: msg} ).then((res) => {
                                            console.log("Sent invalid number message.");
                                        }).catch(msgSendError);
                                    }
                                    else {
                                        if(isNaN(end)) {
                                            end = start;
                                            start = 1;
                                        }
                                        let no = Math.floor(Math.random() * (end-start+1)) + start;
                                        conn.sendMessage(msg.key.remoteJid, "*The random number is:*\n" + no, MessageType.text, {quoted: msg} ).then((res) => {
                                            console.log("Sent random number.");
                                        }).catch(msgSendError);
                                    }
                                }
                                else {
                                    conn.sendMessage(msg.key.remoteJid, "*!rng syntax:*\n\n!rng _<min number> <max number>_\n\nThis command will return a random number between _<min number>_ and _<max number>_ (both included)\nIf _<min number>_ is excluded, then it is assumed to be 1", MessageType.text, {quoted: msg} ).then((res) => {
                                        console.log("Sent random number command help message.");
                                    }).catch(msgSendError);
                                }
                                break;

                            case "helloBEWAbot":
                                console.log("Received greeting from fellow bot");
                                setTimeout(() => {
                                    conn.sendMessage(msg.key.remoteJid, "#helloTKM-Bot", MessageType.text, {quoted:msg}).then((response) => {
                                        console.log("Greeted fellow bot");
                                    }).catch(msgSendError);
                                }, 500);
                                break;
                            
                            case "taboo":
                                // console.log("triggered taboo");
                                // console.log(cmdContent);
                                // if(msg.key.remoteJid === "919638671317-1607864864@g.us") {
                                    if(cmdContent.trim() === "") {
                                        // console.log("found empty message")
                                        let tabooReplyMsg = "";
                                        if(tabooWord === "") {
                                            tabooReplyMsg += "*_No Taboo word/sentence set_*\n";
                                        }
                                        else {
                                            tabooReplyMsg += `*Taboo:* ${tabooWord}\n`;
                                        }
                                        tabooReplyMsg += "\nSet up a Taboo (word or sentence) by typing \"!taboo _taboowordorsentence_ \"";
                                        conn.sendMessage(msg.key.remoteJid, tabooReplyMsg, MessageType.text, {quoted:msg}).then((response) => {
                                            console.log("Sent Taboo info");
                                        }).catch(msgSendError);
                                    }
                                    else {
                                        tabooWord = cmdContent.trim();
                                        fs.writeFile("./txt/temp/taboowrd.txt", tabooWord, () => {
                                            conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Taboo updated!", MessageType.text, {quoted:msg}).then((response) => {
                                                console.log("Taboo updated");
                                            }).catch(msgSendError);
                                        });
                                    }
                                    tabooExempt = true;
                                    break;
                                //}
                            
                            case "allcse":
                                let members = [
                                    '919370108838@s.whatsapp.net',
                                    '919969529264@s.whatsapp.net',
                                    '919667349980@s.whatsapp.net',
                                    '919423592986@s.whatsapp.net',
                                    '917046244503@s.whatsapp.net',
                                    '919920450432@s.whatsapp.net',
                                    '917017600211@s.whatsapp.net',
                                    '918872150472@s.whatsapp.net',
                                    '918700983822@s.whatsapp.net',
                                    '917879937800@s.whatsapp.net'
                                  ];
                                conn.sendMessage(
                                    msg.key.remoteJid, 
                                    '@919667349980 @919423592986 @919370108838 @919969529264 @918872150472 @919920450432 @918700983822 @917046244503 @917879937800 @917017600211',
                                    MessageType.extendedText,
                                    {contextInfo: {
                                        mentionedJid: members
                                    }}
                                ).then((response) => {
                                    console.log("Tagged CSE members");
                                }).catch(msgSendError);
                                break;
                        }
                    }

                }
                
                // taboo code to be run on both tagged and regular msgs
                if(msgType === MessageType.text || msgType === MessageType.extendedText) {
                    const msgText = (msgType === MessageType.text) ? msg.message.conversation : msg.message.extendedTextMessage.text;
                    // console.log(msgText);
                    // a fun little part to kick a member using overused deliberate typos
                    // you saw it first: new feature related to this but allowing any word to be used as kicking criteria
                    // COMING SOON!
                    if(!tabooExempt && (msg.key.remoteJid === "919638671317-1607864864@g.us" || msg.key.remoteJid === "919667349980-1611081671@g.us" || msg.key.remoteJid === "919667349980-1613157139@g.us") && tabooWord != "" && (msgText.toLowerCase().trim() === tabooWord.toLowerCase())) {
                        console.log("Taboo detected");
                        let kickMember = msg.participant;
                        conn.groupRemove(msg.key.remoteJid, [kickMember]).then((modi) => {
                            console.log("Removed people.");
                            console.log("Data received: " + modi);
                            setTimeout(() => {
                                conn.groupAdd(msg.key.remoteJid, [kickMember]).then((modi) => {
                                    console.log("Added people back.");
                                    console.log("Data received: " + modi);
                                }).catch((err) => {
                                    console.log("ERROR in adding member: " + err);
                                });
                            }, 60000);
                        }).catch((err) => {
                            console.log("ERROR in removing member: " + err);
                        });
                    }
                    else if(tabooExempt) {
                        tabooExempt = false;
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
                                conn.sendMessage(msg.key.remoteJid, "BEWAbot: GIF conversion not supported yet! Only regular images supported.", MessageType.text).then((response) => {
                                    console.log("Animated sticker request declined as WIP");
                                });   
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
                        // console.log("triggered");
                        const cmd = msgText.split(" ")[0].substring(1);
                        let cmdContent = msgText.substring(msgText.indexOf(" ") + 1);
                        // console.log(cmd);
                        switch(cmd) {
                            case "sticker":
                                // conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Tagged sticker requests are currently not supported! Send the image again using the command in the caption.", MessageType.text).then((response) => {
                                //     console.log("Tag sticker message received, sent WIP message.");
                                // }).catch(msgSendError);
                                // break;

                                console.log("Received request for converting tagged sticker to image.")
                                let messId = msg.message.extendedTextMessage.contextInfo.stanzaId;
                                conn.loadMessage(msg.key.remoteJid, messId).then((stickerMsg) => {
                                    // console.log(origSticker);
                                    conn.downloadMediaMessage(stickerMsg, "stream").then((imgStream) => {
                                        gm(imgStream).resize(512, 512).background("none").gravity("Center").extent(512, 512).write('sticker.webp', async (err) => {
                                            if(err) {console.log("ERROR in converting to sticker: " + err);}
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
                                        console.log("ERROR in downloading sticker: " + err);
                                    });
                                }).catch((err) => {
                                    console.log("ERROR in getting message: " + err);
                                });
                                
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
                                    conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Tag a text message!", MessageType.text).then((response) => console.log("Message rejected: Non-text message tagged")).catch(msgSendError);
                                }
                                break;

                            case "kiddoShit":
                                let taggedMsgType1 = Object.keys(msg.message.extendedTextMessage.contextInfo.quotedMessage)[0];
                                if(taggedMsgType1 === MessageType.text) {
                                    console.log("Received kiddo conversion request");
                                    let conText = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
                                    // console.log(conText);
                                    let arText = [];
                                    for(let i=0; i<conText.length; i++) {
                                        let ch = conText.charAt(i);
                                        let chNew = ' '
                                        switch(ch) {
                                            case 'r':
                                                chNew = 'l';
                                                break;

                                            case 'j':
                                                chNew = 'd';
                                                break;

                                            case 'l':
                                                chNew = 'r';
                                                break;

                                            case 'd':
                                                chNew = 'j';
                                                break;
                                            
                                            case 'R':
                                                chNew = 'L';
                                                break;

                                            case 'J':
                                                chNew = 'D';
                                                break;

                                            case 'L':
                                                chNew = 'R';
                                                break;

                                            case 'D':
                                                chNew = 'J';
                                                break;
                                            
                                            default: 
                                                chNew = ch;
                                        }
                                        arText.push(chNew);
                                    }
                                    let strText = arText.join('');
                                    conn.sendMessage(msg.key.remoteJid, strText, MessageType.text, {quoted:msg}).then((response) => {
                                        console.log("Sent dual kiddo style message.");
                                    }).catch(msgSendError);
                                }
                                else {
                                    conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Tag a text message!", MessageType.text).then((response) => console.log("Message rejected: Non-text message tagged")).catch(msgSendError);
                                }
                                break;
                            
                            // Converting sticker to image
                            case "toImg": 
                                let stickMsgType = Object.keys(msg.message.extendedTextMessage.contextInfo.quotedMessage)[0];
                                if(stickMsgType === MessageType.sticker) {
                                    console.log("Received request for converting sticker to image.")
                                    let messId = msg.message.extendedTextMessage.contextInfo.stanzaId;
                                    conn.loadMessage(msg.key.remoteJid, messId).then((origSticker) => {
                                        console.log(origSticker);
                                        conn.downloadMediaMessage(origSticker, "stream").then((imgStream) => {
                                            console.log("Downloaded sticker");
                                            let fileName = "";
                                            if(origSticker.message.stickerMessage.isAnimated) {
                                                console.log("animated");
                                                fileName = "stToImg.gif";
                                            }
                                            else {
                                                fileName = "stToImg.png";
                                            }
                                            gm(imgStream).write("stToImg.png", (err) => {
                                                if(err) {console.log("ERROR in converting: " + err);}
                                                else {
                                                    console.log("Converted sticker to image")
                                                    conn.sendMessage(msg.key.remoteJid, { url: ('./' + fileName) }, MessageType.image, {quoted:msg, mimetype:Mimetype.png}).then((response) => {
                                                        console.log("Message sent");
                                                        fs.unlink(fileName, (err) => {
                                                            if(err) {console.log("Error in deleting image: " + err);}
                                                        });
                                                    }).catch((err) => {
                                                        console.log("Error in sending image of sticker: " + err);
                                                    });
                                                }
                                            });
                                        }).catch((err) => {
                                            console.log("ERROR in downloading sticker: " + err);
                                        });
                                    }).catch((err) => {
                                        console.log("ERROR in getting message: " + err);
                                    });
                                }
                                else {
                                    conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Tag a sticker!", MessageType.text).then((response) => console.log("Message rejected: Non-sticker message tagged")).catch(msgSendError);
                                }
                                break;
                            
                            case "tts":
                                let tagMsgType = Object.keys(msg.message.extendedTextMessage.contextInfo.quotedMessage)[0];
                                if(tagMsgType === MessageType.text) {
                                    console.log("Received tagged TTS");
                                    let ogMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
                                    var outFile = new gTTS(ogMsg, "en");
                                    outFile.save("./tmp/outFile.mp3", (err, result) => {
                                        if(err) {
                                            console.log("ERROR in converting to audio: " + err);
                                        }
                                        else {
                                            console.log("Converted to TTS");
                                            conn.sendMessage(msg.key.remoteJid, {url: "./tmp/outFile.mp3"}, MessageType.audio, {quoted:msg, mimetype: Mimetype.mp4Audio, ptt: true}).then((response) => {
                                                console.log("Message sent");
                                                fs.unlink("./tmp/outFile.mp3", (err) => {
                                                    if(err) {console.log("Error in deleting tts audio file: " + err);}
                                                });
                                            }).catch(msgSendError);
                                        }
                                    });
                                    break;
                                    
                                }
                                else {
                                    conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Tag a text message!", MessageType.text).then((response) => console.log("Message rejected: Non-text message tagged")).catch(msgSendError);
                                }
                                break;

                            case "update":
                                let tagMsggType = Object.keys(msg.message.extendedTextMessage.contextInfo.quotedMessage)[0];
                                if(tagMsggType === MessageType.text) {
                                    console.log("Received tagged TTS");
                                    let ogMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
                                    fs.writeFile("./txt/temp/camp.txt", ogMsg, () => {
                                        console.log("File updated.");
                                        conn.sendMessage(msg.key.remoteJid, "Updated file!", MessageType.text, {quoted:msg}).catch(msgSendError);
                                    });
                                    break;
                                    
                                }
                                else {
                                    conn.sendMessage(msg.key.remoteJid, "*BEWAbot:* Tag a text message!", MessageType.text).then((response) => console.log("Message rejected: Non-text message tagged")).catch(msgSendError);
                                }
                                break;
                            
                            case "helloBEWAbot":
                                console.log("Received greeting from fellow bot");
                                setTimeout(() => {
                                    conn.sendMessage(msg.key.remoteJid, "#helloTKM-Bot", MessageType.text, {quoted:msg}).then((response) => {
                                        console.log("Greeted fellow bot");
                                    }).catch(msgSendError);
                                }, 500);
                                break;
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