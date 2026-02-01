import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoSettingsSharp, IoClose, IoTrash } from 'react-icons/io5';
import { useGameStore } from '../store/useGameStore';
import { version } from '../../package.json';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const resetGame = useGameStore(state => state.resetGame);

    const handleReset = () => {
        resetGame();
        setShowResetConfirm(false);
        onClose();
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon settings">
                            <IoSettingsSharp />
                        </div>
                        <h2>설정</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="modal-content">
                    {!showResetConfirm ? (
                        <div className="settings-list">
                            <div className="settings-section">
                                <div className="settings-section-title">데이터 관리</div>
                                <button
                                    className="settings-item danger"
                                    onClick={() => setShowResetConfirm(true)}
                                >
                                    <div className="settings-item-icon">
                                        <IoTrash />
                                    </div>
                                    <div className="settings-item-content">
                                        <div className="settings-item-title">게임 초기화</div>
                                        <div className="settings-item-desc">모든 진행 상황을 삭제합니다</div>
                                    </div>
                                </button>
                            </div>

                            <div className="settings-section">
                                <div className="settings-section-title">정보</div>
                                <div className="settings-info">
                                    <div className="info-row">
                                        <span>버전</span>
                                        <span>{version}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>제작</span>
                                        <span>Tak & MJ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="reset-confirm">
                            <div className="reset-confirm-icon">⚠️</div>
                            <div className="reset-confirm-title">정말 초기화하시겠어요?</div>
                            <div className="reset-confirm-desc">
                                모든 코인, 자산, 업그레이드가 삭제됩니다.<br />
                                이 작업은 되돌릴 수 없습니다.
                            </div>
                            <div className="reset-confirm-buttons">
                                <button
                                    className="toss-button secondary"
                                    onClick={() => setShowResetConfirm(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="toss-button danger"
                                    onClick={handleReset}
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
