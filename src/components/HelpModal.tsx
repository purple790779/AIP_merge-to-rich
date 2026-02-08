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
            description: '코인을 드래그하여 이동하세요. 같은 레벨의 코인을 합치면 다음 레벨로 진화합니다!'
        },
        {
            icon: '🆙',
            title: '시작 레벨',
            description: '코인이 생성될 때의 기본 레벨을 올립니다. (하위 코인은 자동 환원) [Max Lv.11]'
        },
        {
            icon: '🎯',
            title: '머지 보너스',
            description: '코인 합칠 때 10% 확률로 보너스 수익 획득. [Max Lv.60 → 30% 보너스]'
        },
        {
            icon: '📈',
            title: '수익 속도',
            description: '모든 코인의 수익 생산 주기가 빨라집니다. [Max Lv.90 → 1.0초 간격]'
        },
        {
            icon: '💰',
            title: '수익 배율',
            description: '수익 2배 부스트 시 추가 배율 적용. [Max Lv.80 → 9.0배]'
        },
        {
            icon: '🤖',
            title: '자동 병합 속도',
            description: '자동 병합 부스트 시 병합 속도가 빨라집니다. [Max Lv.24 → 0.2초 간격]'
        },
        {
            icon: '⚡',
            title: '자동 생산 속도',
            description: '자동 생산 부스트 시 코인 생성 속도가 빨라집니다. [Max Lv.10 → 0.2초 쿨타임]'
        },
        {
            icon: '💎',
            title: '보석 시스템',
            description: '토스 빌딩(Lv.15) 달성 후 해금되는 특수 재화입니다. [1억원으로 해금]'
        },
        {
            icon: '💾',
            title: '데이터 저장',
            description: '게임 데이터는 기기에 자동 저장됩니다. 브라우저 캐시 삭제 시 데이터가 날아갈 수 있으니 주의하세요!'
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
                            <li>시작 레벨 업그레이드 시 하위 코인은 자동 환원됩니다</li>
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
