import { dataModes } from "../config";
import { Icon } from "./Icons";

export function ModeSelector({ value, onChange }) {
    return (
        <div className="mode-selector" aria-label="Werkmodus">
            {dataModes.map((mode) => (
                <button
                    key={mode.value}
                    type="button"
                    className={`mode-selector__item ${value === mode.value ? "is-active" : ""}`}
                    onClick={() => onChange(mode.value)}
                    title={mode.description}
                >
                    <Icon name={mode.icon} size={14} />
                    <span>{mode.label}</span>
                </button>
            ))}
        </div>
    );
}
