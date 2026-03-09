import { motion } from 'framer-motion';
import { FaQuestion } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
    OFFLINE_REWARD_EFFICIENCY,
    OFFLINE_REWARD_MAX_ELAPSED_MS,
    OFFLINE_REWARD_MIN_ELAPSED_MS,
    RETURN_REWARD_HARD_CAP,
    RETURN_REWARD_HIGH_MULTIPLIER,
    RETURN_REWARD_MAX_MULTIPLIER,
    RETURN_REWARD_MID_MULTIPLIER,
} from '../game/rewards';
import { formatMoney } from '../utils/formatMoney';

interface HelpModalProps {
    onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
    const helpItems = [
        { icon: '🧲', title: '기본 조작', description: '코인을 드래그해서 이동하세요. 같은 레벨끼리 겹치면 다음 레벨로 머지됩니다.' },
        { icon: '📈', title: '시작 레벨', description: '생성되는 코인의 기본 레벨을 올립니다. 하위 코인은 자동으로 환급됩니다.' },
        { icon: '✨', title: '머지 보너스', description: '머지 성공 시 일정 확률로 추가 자산을 얻습니다. 레벨이 높을수록 보너스가 커집니다.' },
        { icon: '⏱️', title: '수익 주기', description: '보유 코인이 쌓은 수익은 정해진 주기마다 지급됩니다. 속도 업그레이드로 간격을 줄일 수 있습니다.' },
        { icon: '✖️', title: '수익 배율', description: '기본 수익에 항상 적용되는 영구 배율입니다. 2배 부스트와도 중첩됩니다.' },
        { icon: '🤖', title: '자동 병합 부스트', description: '광고형 부스트입니다. 설정한 병합 속도에 맞춰 자동으로 머지합니다.' },
        { icon: '⚡', title: '자동 생산 부스트', description: '광고형 부스트입니다. 생성 비용을 쓰면서 자동으로 코인을 생산합니다.' },
        { icon: '💎', title: '보석 시스템', description: '토스 빌딩 이후 더 높은 단계의 보석 코인을 해금할 수 있습니다.' },
        {
            icon: '🎁',
            title: '복귀 / 오프라인 보상',
            description: `48시간 이상 미접속 시 복귀 보상(x${RETURN_REWARD_MID_MULTIPLIER}/x${RETURN_REWARD_HIGH_MULTIPLIER}/x${RETURN_REWARD_MAX_MULTIPLIER}, 최대 ${formatMoney(RETURN_REWARD_HARD_CAP)}원), ${Math.floor(OFFLINE_REWARD_MIN_ELAPSED_MS / (60 * 1000))}분 이상 공백 시 오프라인 보상(${Math.round(OFFLINE_REWARD_EFFICIENCY * 100)}%, 최대 ${Math.floor(OFFLINE_REWARD_MAX_ELAPSED_MS / (60 * 60 * 1000))}시간)을 정산합니다.`,
        },
        { icon: '💾', title: '저장 방식', description: '게임 데이터는 기기 브라우저 저장소에 자동 저장됩니다. 캐시 삭제 시 데이터가 사라질 수 있습니다.' },
    ];

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
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

                <div className="modal-content">
                    <div className="help-list">
                        {helpItems.map((item) => (
                            <div key={item.title} className="help-item">
                                <div className="help-item-icon">{item.icon}</div>
                                <div className="help-item-content">
                                    <div className="help-item-title">{item.title}</div>
                                    <div className="help-item-desc">{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="help-tips">
                        <div className="tips-header">팁</div>
                        <ul className="tips-list">
                            <li>보드가 꽉 차면 새 코인을 생산할 수 없습니다.</li>
                            <li>높은 레벨 코인을 만들수록 주기 수익이 빠르게 커집니다.</li>
                            <li>생성 레벨 업그레이드는 초반 템포를 크게 바꿉니다.</li>
                            <li>복귀 보상이 대기 중이면 먼저 수령/폐기한 뒤 다음 오프라인 정산 흐름이 열립니다.</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="toss-button primary" onClick={onClose}>
                        확인
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
