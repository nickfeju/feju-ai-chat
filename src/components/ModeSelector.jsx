import { dataModes } from "../config";

export function ModeSelector({ value, onChange }) {
    return (
        <div className="mode-selector" aria-label="Gegevensbron">
            {dataModes.map((mode) => (
                <button
                    key={mode.value}
                    type="button"
                    className={`mode-selector__item ${value === mode.value ? "is-active" : ""}`}
                    onClick={() => onChange(mode.value)}
                    title={mode.description}
                >
                    {mode.label}
                </button>
            ))}
        </div>
    );
}
