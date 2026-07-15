import { Icon } from "./Icons";
import { ModeSelector } from "./ModeSelector";

export function ChatComposer({ question, onQuestionChange, mode, onModeChange, loading, onSend, onCancel }) {
    const onKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    return (
        <div className="composer">
            <div className="composer__top">
                <ModeSelector value={mode} onChange={onModeChange} />
            </div>
            <textarea
                value={question}
                onChange={(event) => onQuestionChange(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Vraag bijvoorbeeld: welke klanten hebben deze maand opvallend meer tickets?"
                rows={3}
            />
            <div className="composer__footer">
                <span>Enter verstuurt · Shift + Enter voor een nieuwe regel</span>
                {loading ? (
                    <button className="button button--danger" type="button" onClick={onCancel}><Icon name="stop" size={17} /> Stoppen</button>
                ) : (
                    <button className="button button--primary" type="button" onClick={onSend} disabled={!question.trim()}><Icon name="send" size={17} /> Versturen</button>
                )}
            </div>
        </div>
    );
}
