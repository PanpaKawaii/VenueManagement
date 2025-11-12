import React from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
    title?: string;
    message?: string;
    confirm?: string;
    cancel?: string;
    color?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title = "Confirm",
    message = "Are you sure?",
    confirm = "CONFIRM",
    cancel = "CANCEL",
    color = "#007bff",
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="confirm-modal">
            <div className="modal-box">
                <div className="title">{title}</div>
                <div className="message">{message}</div>
                <div className="buttons">
                    {confirm && <button type="button" onClick={onConfirm} style={{ backgroundColor: color }}>
                        <div className="text">{confirm}</div>
                    </button>}
                    {cancel && <button type="button" onClick={onCancel} className="cancel-btn">
                        <div className="text">{cancel}</div>
                    </button>}
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;