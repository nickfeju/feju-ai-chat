import ReactMarkdown from "react-markdown";
import { Icon } from "./Icons";
import { SourceBadges } from "./SourceBadges";
import { Presentation } from "./Presentation";
import { ExecutiveCopilotPresentation } from "./ExecutiveCopilotPresentation";
import { DecisionPresentation } from "./DecisionPresentation";
import { ManagementActions } from "./ManagementActions";

export function ChatMessage({ message, onRetry, onAction }) {
    const isUser = message.role === "user";

    const copyMessage = async () => {
        await navigator.clipboard.writeText(message.content);
    };

    return (
        <article className={`message ${isUser ? "message--user" : "message--assistant"}`}>
            {!isUser && <div className="assistant-avatar">fé</div>}
            <div className="message__body">
                <div className="message__meta"><strong>{isUser ? "Jij" : "FéjuAI"}</strong></div>
                <div className="message__bubble">
                    {isUser ? <p>{message.content}</p> : <div className="markdown-body"><ReactMarkdown>{message.content}</ReactMarkdown></div>}
                    {!isUser && <Presentation presentation={message.presentation} />}
                    {!isUser && <ExecutiveCopilotPresentation data={message.data || message.raw} />}
                    {!isUser && <DecisionPresentation data={message.data || message.raw} />}
                    {!isUser && <ManagementActions message={message} onSelect={onAction} />}
                </div>
                {!isUser && (
                    <div className="message__footer">
                        <SourceBadges mode={message.mode} sources={message.sources} dataFreshness={message.dataFreshness} />
                        <div className="message__tools">
                            <button type="button" onClick={copyMessage} title="Kopiëren"><Icon name="copy" size={15} /> Kopiëren</button>
                            {onRetry && <button type="button" onClick={onRetry} title="Opnieuw proberen"><Icon name="retry" size={15} /> Opnieuw</button>}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
