const INJECTED_ELEMENT_ID = "#secondary.style-scope.ytd-watch-flexy";


const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

document.body.style.fontFamily = "'Poppins', sans-serif";


class TabManager {
    constructor() {
        this.tabs = {
            "Talk to Video": this.createTalkToVideoContent,
            "Notes Generator": this.createNotesGeneratorContent,
            "✨Chapters Generator": this.createTimestampGeneratorContent,
            "summary": this.createSummaryContent
        };
        this.tabContentState = {}; 
    }

    clearTabContentState() {
        this.tabContentState = {};
        window.alert("Tab get cleaned");
        
        const container = document.getElementById("custom-tabs-container");
        if (container) {
            container.remove(); 
        }
        
        this.injectCustomDiv();
    }
    

    createTalkToVideoContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.style.cssText = "padding: 16px; background-color: #2a2a2a; border: 1px solid #444; border-radius: 8px; color: #fff; display: flex; flex-direction: column; height: 400px;";

        // Chat history container
        const chatHistory = document.createElement("div");
        chatHistory.id = "chat-history";
        chatHistory.style.cssText = "flex: 1; overflow-y: auto; margin-bottom: 12px; padding: 8px; background-color: #1e1e1e; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;";
        contentWrapper.appendChild(chatHistory);

        // Input container
        const inputContainer = document.createElement("div");
        inputContainer.style.cssText = "display: flex; align-items: center; gap: 8px; width: 100%;";

        // Input field
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Type your message...";
        inputField.style.cssText = "flex: 1; padding: 10px; background-color: #333; border: 1px solid #444; border-radius: 6px; color: #fff; font-size: 14px;";

        // Send button
        const sendButton = document.createElement("div");
        sendButton.textContent = "SEND"; 
        sendButton.style.cssText = "cursor: pointer; font-size: 18px; user-select: none; transition: opacity 0.2s;";
        sendButton.addEventListener("mouseover", () => {
            sendButton.style.opacity = "0.8";
        });
        sendButton.addEventListener("mouseout", () => {
            sendButton.style.opacity = "1";
        });

        
        const addMessageToChat = (message, isUser) => {
            const messageElement = document.createElement("div");
            messageElement.style.cssText = `padding: 8px 12px; border-radius: 8px; max-width: 80%; align-self: ${
                isUser ? "flex-end" : "flex-start"
            }; background-color: ${isUser ? "#4a90e2" : "#444"}; color: #fff; word-wrap: break-word;`;
        
           
            const md = window.markdownit();
            let cleanedMarkdown = message
            if(!isUser){
                cleanedMarkdown = message.substring(12);
            }
            console.log(cleanedMarkdown)
            messageElement.innerHTML = md.render(cleanedMarkdown);
        
            
            const style = document.createElement("style");
            style.textContent = `
                .chat-message h1 { color: #1e90ff; font-size: 24px; margin: 8px 0; } /* Blue for h1 */
                .chat-message h2 { color: #00bfff; font-size: 22px; margin: 8px 0; } /* Light blue for h2 */
                .chat-message h3 { color: #87ceeb; font-size: 20px; margin: 8px 0; } /* Lighter blue for h3 */
                .chat-message p { color: #fff; font-size: 16px; margin: 4px 0; } /* White for paragraphs */
                .chat-message strong { color: #ffd700; } /* Gold for bold text */
                .chat-message em { color: #ffa07a; } /* Light salmon for italic text */
                .chat-message code { background-color: #1e1e1e; color: #00ff00; padding: 2px 4px; border-radius: 4px; } /* Green for code */
                .chat-message pre { background-color: #1e1e1e; color: #00ff00; padding: 8px; border-radius: 6px; overflow-x: auto; } /* Green for preformatted text */
                .chat-message a { color: #00bfff; text-decoration: underline; } /* Light blue for links */
                .chat-message ul, .chat-message ol { color: #fff; margin: 4px 0; padding-left: 20px; } /* White for lists */
                .chat-message li { margin: 4px 0; } /* Margin for list items */
            `;
        
        
            messageElement.classList.add("chat-message");
        
            
            messageElement.appendChild(style);
        
            
            chatHistory.appendChild(messageElement);
        
          
            chatHistory.scrollTop = chatHistory.scrollHeight;
        };

        
        // Function to handle sending a message
        const handleSendMessage = async () => {
            const userMessage = inputField.value.trim();
            if (!userMessage) return;

            
            addMessageToChat(`${userMessage}`, true);
            inputField.value = "";

            
            try {
                const geminiResponse = await getGeminiResponse(userMessage);
                console.log(geminiResponse);
                addMessageToChat(` ${geminiResponse}`, false);
            } catch (error) {
                console.error("Error:", error);
                addMessageToChat(`<strong>Bot:</strong> Error fetching response.`, false);
            }
        };

        // Send message on button click
        sendButton.addEventListener("click", handleSendMessage);

        // Send message on Enter key press
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSendMessage();
            }
        });

       
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(sendButton);

       
        contentWrapper.appendChild(inputContainer);

        return contentWrapper;
    }


    createSummaryContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.style.cssText = `
            padding: 16px; 
            background-color: #2a2a2a; 
            border: 1px solid #444; 
            border-radius: 8px; 
            color: #fff; 
            height: 400px; 
            overflow-y: auto; 
            scrollbar-width: thin; 
            scrollbar-color: #888 #2a2a2a;
        `;
    
        
        const loadingMessage = document.createElement("div");
        loadingMessage.innerText = "Loading summary...✨✨";
        loadingMessage.style.cssText = "text-align: center; padding: 10px; font-size: 16px; color: #ccc;";
        contentWrapper.appendChild(loadingMessage);
    
        // Fetch summary and display it
        fetchSummary().then((summary) => {
            contentWrapper.removeChild(loadingMessage);
    
            const cleanedMarkdown = summary.replace(/```markdown|```/g, "").trim();
            const md = window.markdownit();
            const parsedSummary = md.render(cleanedMarkdown);
    
            
            const summaryContainer = document.createElement("div");
            summaryContainer.innerHTML = parsedSummary;
            summaryContainer.style.cssText = `
                padding: 12px;
                line-height: 1.6;
                font-size: 16px;
                border-left: 2px solid white;
            `;
    
        
            const style = document.createElement("style");
            style.innerHTML = `
                .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                    margin-top: 16px;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #f1c40f;
                }
                .markdown-content p {
                    margin: 10px 0;
                    padding: 4px 0;
                    border-bottom: 1px solid white;
                }
                .markdown-content ul, .markdown-content ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .markdown-content li {
                    margin-bottom: 6px;
                }
                .markdown-content pre {
                    background-color: #1e1e1e;
                    padding: 10px;
                    border-radius: 6px;
                    overflow-x: auto;
                    border: 1px solid white;
                }
                .markdown-content code {
                    background-color: #333;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid white;
                }
            `;
            document.head.appendChild(style);
    
            summaryContainer.classList.add("markdown-content");
            contentWrapper.appendChild(summaryContainer);
        }).catch((error) => {
            console.error("Error fetching summary:", error);
            const errorMessage = document.createElement("div");
            errorMessage.innerText = "Error loading summary. Please try again.";
            errorMessage.style.cssText = "text-align: center; padding: 10px; color: #ff6b6b;";
            contentWrapper.appendChild(errorMessage);
        });
    
        return contentWrapper;
    }

    createNotesGeneratorContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.style.cssText = `
            padding: 16px; 
            background-color: #2a2a2a; 
            border: 1px solid #444; 
            border-radius: 8px; 
            color: #fff; 
            height: 400px; 
            overflow-y: auto; 
            scrollbar-width: thin; 
            scrollbar-color: #888 #2a2a2a;
        `;
    
       
        const loadingMessage = document.createElement("div");
        loadingMessage.innerText = "Loading notes... ✨✨";
        loadingMessage.style.cssText = "text-align: center; padding: 10px; font-size: 16px; color: #ccc;";
        contentWrapper.appendChild(loadingMessage);
    
        // Fetch notes and display in tab
        fetchNotes().then((notes) => {
           
            contentWrapper.removeChild(loadingMessage);
    
           
            console.log(notes)
            const cleanedMarkdown = notes.replace(/```markdown|```/g, "").trim();
            const md = window.markdownit();
            // window.alert(md.render(cleanedMarkdown));
            const parsedNotes =  md.render(cleanedMarkdown);
    
            
            const notesContainer = document.createElement("div");
            notesContainer.innerHTML = parsedNotes;
            notesContainer.style.cssText = `
                padding: 12px;
                line-height: 1.6;
                font-size: 16px;
                border-left: 2px solid white;
            `;
    
            
            const style = document.createElement("style");
            style.innerHTML = `
                .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                    margin-top: 16px;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #f1c40f;
                }
                .markdown-content p {
                    margin: 10px 0;
                    padding: 4px 0;
                    border-bottom: 1px solid white;
                }
                .markdown-content ul, .markdown-content ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .markdown-content li {
                    margin-bottom: 6px;
                }
                .markdown-content pre {
                    background-color: #1e1e1e;
                    padding: 10px;
                    border-radius: 6px;
                    overflow-x: auto;
                    border: 1px solid white;
                }
                .markdown-content code {
                    background-color: #333;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid white;
                }
            `;
            document.head.appendChild(style);
    
            notesContainer.classList.add("markdown-content");
            contentWrapper.appendChild(notesContainer);
        }).catch((error) => {
            console.error("Error fetching notes:", error);
            const errorMessage = document.createElement("div");
            errorMessage.innerText = "Error loading notes. Please try again.";
            errorMessage.style.cssText = "text-align: center; padding: 10px; color: #ff6b6b;";
            contentWrapper.appendChild(errorMessage);
        });
    
        return contentWrapper;
    }
    
    createTimestampGeneratorContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.style.cssText = `
            padding: 16px; 
            height: 400px;  
            background-color: #2a2a2a; 
            border: 1px solid #555; 
            border-radius: 10px; 
            color: #fff;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #888 #2a2a2a;
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
        `;
    
       
        const loadingMessage = document.createElement("div");
        loadingMessage.innerText = "Loading chapters... ✨✨";
        loadingMessage.style.cssText = "text-align: center; padding: 10px; font-size: 16px; color: #ccc;";
        contentWrapper.appendChild(loadingMessage);
    
        // Fetch and display chapters
        fetchChapters().then((chapters) => {
            contentWrapper.removeChild(loadingMessage);
            const cleanedMarkdown = chapters.replace(/```json|```/g, "").trim();
    
            try {
                const chaptersData = JSON.parse(cleanedMarkdown);
                const chaptersList = document.createElement("ul");
                chaptersList.style.cssText = "list-style-type: none; padding: 0; margin: 0;";
    
                chaptersData.forEach((chapter) => {
                    const chapterItem = document.createElement("li");
                    chapterItem.style.cssText = `
                        margin-bottom: 12px;
                        padding: 12px;
                        background: linear-gradient(135deg, #1e1e1e, #292929);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0px 0px 5px rgba(255, 255, 255, 0.1);
                    `;
    
                    chapterItem.addEventListener("mouseover", () => {
                        chapterItem.style.background = "#3a3a3a";
                        chapterItem.style.boxShadow = "0px 0px 8px rgba(255, 255, 255, 0.2)";
                    });
                    chapterItem.addEventListener("mouseout", () => {
                        chapterItem.style.background = "linear-gradient(135deg, #1e1e1e, #292929)";
                        chapterItem.style.boxShadow = "0px 0px 5px rgba(255, 255, 255, 0.1)";
                    });
    
                    const chapterTitle = document.createElement("div");
                    chapterTitle.style.cssText = "font-weight: bold; font-size: 18px; color:rgb(37, 128, 212); margin-bottom: 4px;";
                    chapterTitle.innerText = chapter.Title;
    
                    const chapterDescription = document.createElement("div");
                    chapterDescription.style.cssText = "font-size: 14px; color: #ddd; margin-bottom: 4px;";
                    chapterDescription.innerText = chapter.des;
    
                    const chapterTime = document.createElement("div");
                    chapterTime.style.cssText = "font-size: 12px; color: #bbb; font-style: italic;";
                    chapterTime.innerText = `Start Time: ${chapter.startTime}`;
    
                    chapterItem.appendChild(chapterTitle);
                    chapterItem.appendChild(chapterDescription);
                    chapterItem.appendChild(chapterTime);
    
                    chapterItem.addEventListener("click", () => {
                        const videoPlayer = document.querySelector("video");
                        if (videoPlayer) {
                            const time = parseFloat(chapter.startTime);
                            videoPlayer.currentTime = time;
                        }
                    });
    
                    chaptersList.appendChild(chapterItem);
                });
                contentWrapper.appendChild(chaptersList);
            } catch (error) {
                console.error("Error parsing chapters:", error);
                const errorMessage = document.createElement("div");
                errorMessage.innerText = "Error loading chapters. Please try again.";
                errorMessage.style.cssText = "text-align: center; padding: 10px; color: #ff6b6b;";
                contentWrapper.appendChild(errorMessage);
            }
        }).catch((error) => {
            console.error("Error fetching chapters:", error);
            const errorMessage = document.createElement("div");
            errorMessage.innerText = "Error loading chapters. Please try again.";
            errorMessage.style.cssText = "text-align: center; padding: 10px; color: #ff6b6b;";
            contentWrapper.appendChild(errorMessage);
        });
    
        return contentWrapper;
    }
    


    createTabContent(tabName) {
        if (!this.tabContentState[tabName]) {
            const tabFunction = this.tabs[tabName];
            this.tabContentState[tabName] = tabFunction ? tabFunction.call(this) : this.createDefaultContent();
        }
        return this.tabContentState[tabName];
    }

    createDefaultContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.style.cssText = "padding: 16px; background-color: #2a2a2a; border: 1px solid #444; border-radius: 8px; color: #fff;";
        contentWrapper.innerText = "Select a tab to view content.";
        return contentWrapper;
    }

    injectCustomDiv() {
        if (!window.location.href.match(/https:\/\/www\.youtube\.com\/watch\?v=.+/)) {
            return;
        }

        if (document.getElementById("custom-tabs-container")) {
            return;
        }

        const container = document.createElement("div");
        container.id = "custom-tabs-container";
        container.style.cssText = "padding: 12px; background-color: #1e1e1e; border: 1px solid #333; border-radius: 8px; box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3); margin-top: 12px; color: #fff;";

        const tabButtonsContainer = document.createElement("div");
        tabButtonsContainer.style.cssText = "display: flex; gap: 8px; margin-bottom: 12px;";

        const contentDiv = document.createElement("div");
        contentDiv.appendChild(this.createDefaultContent());

        Object.keys(this.tabs).forEach((tabName) => {
            const tabButton = document.createElement("button");
            tabButton.innerText = tabName;
            tabButton.style.cssText = "padding: 8px 16px; font-size: 14px; font-weight: 500; color: #ccc; background-color: #333; border-radius: 8px; border: none; cursor: pointer; transition: background-color 0.2s, color 0.2s; display: flex; align-items: center; gap: 6px;";

            tabButton.addEventListener("mouseover", () => {
                tabButton.style.backgroundColor = "#444";
            });

            tabButton.addEventListener("mouseout", () => {
                if (!tabButton.classList.contains("active")) {
                    tabButton.style.backgroundColor = "#333";
                }
            });

            tabButton.addEventListener("click", () => {
                contentDiv.innerHTML = "";
                contentDiv.appendChild(this.createTabContent(tabName));
                tabButtonsContainer.querySelectorAll("button").forEach(btn => {
                    btn.classList.remove("active");
                    btn.style.backgroundColor = "#333";
                    btn.style.color = "#ccc";
                });
                tabButton.classList.add("active");
                tabButton.style.backgroundColor = "#555";
                tabButton.style.color = "#fff";
            });

            tabButtonsContainer.appendChild(tabButton);
        });

        container.appendChild(tabButtonsContainer);
        container.appendChild(contentDiv);
        const targetElement = document.querySelector(INJECTED_ELEMENT_ID);
        if (targetElement) {
            targetElement.prepend(container);
        }
    }
}


// Function to check if the video is playing
function isVideoPlaying() {
    const videoPlayer = document.querySelector("video");
    return videoPlayer && !videoPlayer.paused;
}


let tabManager = null;
function handleInjection() {
    if (isVideoPlaying()) {
        if (!tabManager) {
            tabManager = new TabManager(); 
        }
        tabManager.injectCustomDiv();
    }
}





// ------------------------xxxxxxxxxxxxxxxx---------------xxxxxxxxx-----------------

function blurVideos() {
    chrome.storage.sync.get({ keywords: [] }, (result) => {
        const keywords = result.keywords || [];
        if (!keywords.length) return;

        // Get all video elements on the page
        const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');

        videos.forEach(video => {
            const titleElement = video.querySelector('#video-title');
            if (!titleElement) return;

            const title = titleElement.innerText.toLowerCase();
            if (keywords.some(keyword => title.includes(keyword.toLowerCase()))) {
                // Apply a blur effect and make the video unclickable
                video.style.filter = 'blur(10px)';
                video.style.pointerEvents = 'none';
                titleElement.style.color = '#888'; 
            }
        });
    });
}

function applyPreferences() {
    chrome.storage.sync.get(['blockShorts', 'blockUrl'], (result) => {
        const blockShorts = result.blockShorts || false;
        const blockUrl = result.blockUrl || false;

        // Block Shorts button
        if (blockShorts) {
            const btn1 = document.querySelector('ytd-mini-guide-entry-renderer[aria-label="Shorts"]');
            const btn2 = document.querySelector('ytd-guide-entry-renderer a#endpoint[title="Shorts"]');

            if (btn1) btn1.style.display = "none";
            if (btn2) btn2.style.display = "none";
        }

        // Block URLs
        if (blockUrl) {
            const urls = document.querySelectorAll('a[href*="/shorts/"]');
            urls.forEach(url => url.style.display = 'none');
        }
    });
}

function setupObservers() {
   
    const observer = new MutationObserver(() => {
        blurVideos();
        applyPreferences();
        handleInjection();
        fetchSubTitleIfVideoChanged().then(() => console.log("success")).catch(e => console.log("error"));

    });

    
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    blurVideos();
    applyPreferences();
    handleInjection();
    fetchSubTitleIfVideoChanged().then(() => console.log("success")).catch(e => console.log("error"));


}

setupObservers();


// Listen for messages from background script to update preferences
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updatePreferences') {
        blurVideos();
        applyPreferences();
    }
});








const API_KEY = "AIzaSyDlDIyb9uuEF0Ya34aE0Nnn_8KOpvuuxOY"
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
let videoSubTitle = "";

let currentVideoId = null;

function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

async function fetchSubTitleIfVideoChanged() {
    const newVideoId = getVideoId();
    if (newVideoId && newVideoId !== currentVideoId) {
        currentVideoId = newVideoId;
        await fetchSubTitle(currentVideoId);
        if (tabManager) {
            window.alert("clreaded")
            tabManager.clearTabContentState();
        }
    }

}

// Function to fetch subtitle from the video transcript
async function fetchSubTitle(videoId) {
    try {
        const response = await fetch(`https://product-answer.vercel.app/api/transcript/${videoId}`);
        if (response.ok) {
            videoSubTitle = await response.json();
        } else {
            console.error("Failed to fetch subtitle:", response.status);
        }
    } catch (error) {
        console.error("Error fetching subtitle:", error);
    }
}


// Function to fetch summary from the video tra
async function fetchSummary() {
    console.log(videoSubTitle);
    const formattedtext = videoSubTitle?.transcript?.map((sub) => `${sub.start}s - ${sub.start + sub.duration}s: ${sub.text}`).join("\n");
    window.alert(formattedtext);
    const prompt = `
    You are an advanced AI assistant. Your task is to process timestamped captions from a video and generate a concise summary in Markdown format. The summary should be **clear, concise, and well-organized** while ensuring readability.
    
    The transcript is as follows:
    ${formattedtext}
    
    ### 📝 Formatting Guidelines:
    - Use **bullet points** for clarity.  
    - Highlight **key terms** in bold for emphasis.  
    - Keep the summary **short and to the point**.
    
    ### 🔒 Strict Content Scope:
    1. **Stick to the video content** – Only generate a summary **directly based on the transcript**.  
    2. **No extra commentary** – Avoid opinions, assumptions, or external information not found in the video.  
    3. **No promotions** – Do **not** include calls to action (e.g., “Like, Subscribe, Comment”) or mentions of future content (e.g., “Next part coming soon”).  
    
    ---
    
    ## 📌 Summary  
    
    - **[Key point 1]**  
    - **[Key point 2]**  
    - **[Key point 3]**  
    
    ---
    `;
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text:  `${prompt}` }] }],
            }),
        });
        console.log(response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Error:", error);
        return "Error fetching response.";
    }
}



// Function to fetch response from the Gemini API
async function getGeminiResponse(prompt) {

    console.log(videoSubTitle);
    const formattedtext = videoSubTitle?.transcript?.map((sub) => `${sub.start}s - ${sub.start + sub.duration}s: ${sub.text}`).join("\n");
    window.alert(formattedtext);
    const context = `
    🎯 YouTube AI Extension – Context & Response Guidelines
    
    📝 Purpose  
    You are a Nexus AI extension designed by Team Decent Dev to assist users by providing insights, summaries, and relevant information only related to the YouTube video they are currently watching. Your responses must be based strictly on the provided video subtitles.  
    
    📌 Current Video Subtitle:  
    "${formattedtext}"  
    
    ---
    
    📜 Rules & Guidelines  
    Format the given time in seconds or minutes for better readability:
    If the time is less than 60 seconds, display it in seconds.
    If the time is 60 seconds or more, convert and display it in minutes (rounded off to the nearest integer without decimals).
    Ensure the result is presented in a user-friendly way.
    Use bold text to emphasize key terms in the output.
    Wrap the time stamps result in a code block for better visibility.
    ✅ Response Format  
    - **Please respond in Markdown** for better rendering on a webpage.  
    - Use appropriate **headings (#, ##), bullet points (-, *), and code blocks (\`\`\`)** for any code snippets.  
    - Ensure proper **padding and margin** for readability.  
    
    Strict Content Scope

    Do Not Mention Subtitles:
    Never inform the user that your responses are based on subtitles.
    Act as if your knowledge comes from the video itself, not the subtitles.

    Strictly Video-Related Responses:
    Only answer questions directly related to the video's content or its domain.
    If the query falls within the domain of the video (even if not explicitly mentioned in the subtitles), provide a solution or explanation.
    For example, if the video is about programming, answer programming-related questions even if the subtitles don’t explicitly mention the specific query.

    Redirect Unrelated Queries:
    If the user asks about unrelated topics (e.g., weather, news, general knowledge), politely redirect them to ask about the video instead.

    Ensure responses are concise, accurate, and well-structured.
    Use Markdown formatting for better readability (e.g., headings, bullet points, code blocks).
    ---
    
    💡 Example Interactions  
    
    🎥 **User:** "What is the main topic of this video?"  
    💬 **AI:**  
    \`\`\`markdown  
    The main topic of this video is **[topic]**, as discussed by the creator in the first few minutes.  
    \`\`\`  
    
    ❌ **User:** "What's the weather like today?"  
    💬 **AI:**  
    \`\`\`markdown  
    I’m here to assist with YouTube-related content. Let me know if you have any questions about this video!  
    \`\`\`  
    
    🎞️ **User:** "Can you summarize this video?"  
    💬 **AI:**  
    \`\`\`markdown  
    Sure! This video covers:  
    - **[Key Point 1]**  
    - **[Key Point 2]**  
    - **[Key Point 3]**  
    
    The creator discusses **[main ideas]** and provides **[examples/insights]**.  
    \`\`\`  
    
    ⏳ **User:** "When does the creator talk about [topic]?"  
    💬 **AI:**  
    \`\`\`markdown  
    The creator discusses **[topic]** at **[timestamp]**.  
    
    ### Summary of that section:  
    [Brief explanation here]  
    \`\`\`  
    
    ---
    
    📌 Response Strategy  
    ✔ If the query is **related to the video**, provide a **clear, structured, and informative response** in Markdown.  
    ✔ If the query is **unrelated**, politely inform the user that your assistance is limited to **YouTube video content**.  
    
    🚀 Now, generate a response based on these guidelines.
    `;
    

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${context}\n\nUser Query: ${prompt}` }] }],
            }),
        });
        console.log(response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Error:", error);
        return "Error fetching response.";
    }
}



// Function to fetch chapters from the video transcript
async function fetchChapters() {
    console.log(videoSubTitle);
    const formattedtext = videoSubTitle?.transcript?.map((sub) => `${sub.start}s - ${sub.start + sub.duration}s: ${sub.text}`).join("\n");
    // window.alert(formattedtext);
    const prompt = `
You are given a video transcript with timestamps. Your task is to analyze the transcript and generate a list of chapters in the following format:
[
    { startTime: "start time of video", Title: "Chapter title", des: "Chapter description" },
    ...
]

don't write anyhing else rather than this format no triple backticks just above format no more words

The transcript is as follows:
${formattedtext}

Please generate the chapters based on the content of the transcript. Ensure that each chapter has a meaningful title and a brief description that summarizes the content of that segment.
`;
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text:  `${prompt}` }] }],
            }),
        });
        console.log(response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Error:", error);
        return "Error fetching response.";
    }
}



// It will fetch the quick notes from the video
async function fetchNotes() {
    console.log(videoSubTitle);
    const formattedtext = videoSubTitle?.transcript?.map((sub) => `${sub.start}s - ${sub.start + sub.duration}s: ${sub.text}`).join("\n");
    window.alert(formattedtext);
    const prompt = `
    You are an advanced AI assistant. Your task is to process timestamped captions from a video and generate well-structured, detailed notes in Markdown format. The output should be **clear, concise, and well-organized** while ensuring readability.
    
    The transcript is as follows:
    ${formattedtext}
    
    ### 📝 Formatting Guidelines:
    - Use **timestamps** (🕒) for clear navigation.  
    - Highlight **key terms** in bold for emphasis.  
    - Separate sections with horizontal lines (**---**) for clarity.  
    - Utilize **structured headings and bullet points** for readability.  
    - Include **emojis** (✨) to enhance engagement without overuse.  
    
    ### 🔒 Strict Content Scope:
    1. **Stick to the video content** – Only generate notes **directly based on the transcript**.  
    2. **No extra commentary** – Avoid opinions, assumptions, or external information not found in the video.  
    3. **No promotions** – Do **not** include calls to action (e.g., “Like, Subscribe, Comment”) or mentions of future content (e.g., “Next part coming soon”).  
    
    ---
    
    ## 📌 Detailed Notes  
    
    ## 🔹 Introduction  
    Provide an overview of the topic covered in the video. Summarize key ideas concisely.
    
    ---
    
    🌟 **Key Highlights**
    🕒 **[start Timestamp in hh:mm:ss]** – **[Topic]**  
    ✨ **[Key point]**  
    
    🕒 **[Timestamp]** – **[Topic]**  
    ✨ **[Explanation]**  
    
    ---
    
    ## 🔍 Deep Dive  
    
    ### 🧠 **Concept 1**  
    - **Definition**  
    - **Explanation**  
    - **Examples (if applicable)**  
    
    ### 🚀 **Concept 2**  
    - **How it works**  
    - **Real-world applications**  
    
    ---
    
    ## ✅ Summary  
    - **[Key takeaway 1]**  
    - **[Key takeaway 2]**  
    - **[Key takeaway 3]**  
    
    ---
    `;
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text:  `${prompt}` }] }],
            }),
        });
        console.log(response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Error:", error);
        return "Error fetching response.";
    }
}

