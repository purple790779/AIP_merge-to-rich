import { motion } from 'framer-motion';
import { FaQuestion } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

interface HelpModalProps {
    onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
    const helpItems = [
        {
            icon: '🎮',
            title: '기본 조작',
            description: '코인을 드래그하여 이동하세요. 같은 레벨의 코인을 합치면 레벨업!'
        },
        {
            icon: '💰',
            title: '수익 창출',
            description: '코인은 자동으로 초당 수익을 생성합니다. 레벨이 높을수록 수익도 높아요.'
        },
        {
            icon: '⬆️',
            title: '업그레이드',
            description: '상점에서 시작 레벨과 생산 속도를 업그레이드할 수 있어요.'
        },
        {
            icon: '📖',
            title: '도감',
            description: '지금까지 모은 화폐들을 도감에서 확인하세요.'
        },
        {
            icon: '\u267B\uFE0F',
            title: '\uB808\uBCA8 \uC5C5\uADF8\uB808\uC774\uB4DC \uD658\uC6D0',
            description: '\uC2DC\uC791 \uB808\uBCA8\uC744 \uC62C\uB9AC\uBA74 \uADF8\uBCF4\uB2E4 \uB0AE\uC740 \uCF54\uC778\uC740 \uC790\uB3D9\uC73C\uB85C \uC0AC\uB77C\uC9C0\uACE0 \uCD1D\uC790\uC0B0\uC73C\uB85C \uD658\uC6D0\uB429\uB2C8\uB2E4.'
        },

    ];

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
                        <div className="modal-icon help">
                            <FaQuestion />
                        </div>
                        <h2>도움말</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="modal-content">
                    <div className="help-list">
                        {helpItems.map((item, index) => (
                            <div key={index} className="help-item">
                                <div className="help-item-icon">{item.icon}</div>
                                <div className="help-item-content">
                                    <div className="help-item-title">{item.title}</div>
                                    <div className="help-item-desc">{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="help-tips">
                        <div className="tips-header">💡 팁</div>
                        <ul className="tips-list">
                            <li>보드가 꽉 차면 더 이상 코인을 생산할 수 없어요</li>
                            <li>높은 레벨 코인일수록 더 많은 수익을 얻을 수 있어요</li>
                            <li>업그레이드는 장기적으로 큰 도움이 됩니다</li>
                            <li>\uC2DC\uC791 \uB808\uBCA8 \uC5C5\uADF8\uB808\uC774\uB4DC \uC2DC \uD558\uC704 \uCF54\uC778\uC740 \uC790\uB3D9 \uD658\uC6D0\uB429\uB2C8\uB2E4.</li>
                        </ul>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="modal-footer">
                    <button className="toss-button primary" onClick={onClose}>
                        확인
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
