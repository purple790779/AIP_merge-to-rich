// 간단한 Web Audio API 기반 사운드 매니저
// 외부 파일 없이 프로그래매틱하게 사운드 생성

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        return this.audioContext;
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    // 코인 생성 사운드
    playSpawn() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    // 머지 성공 사운드
    playMerge() {
        if (!this.enabled) return;
        const ctx = this.getContext();

        // 두 음 연속 재생 (성공적인 느낌)
        [0, 0.08].forEach((delay, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            const freq = i === 0 ? 523.25 : 783.99; // C5 -> G5
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);

            gainNode.gain.setValueAtTime(0.15, ctx.currentTime + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);

            oscillator.start(ctx.currentTime + delay);
            oscillator.stop(ctx.currentTime + delay + 0.15);
        });
    }

    // 레벨업 사운드 (높은 레벨 머지)
    playLevelUp() {
        if (!this.enabled) return;
        const ctx = this.getContext();

        // 상승하는 아르페지오
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

            gainNode.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.2);

            oscillator.start(ctx.currentTime + i * 0.06);
            oscillator.stop(ctx.currentTime + i * 0.06 + 0.2);
        });
    }

    // 클릭/탭 사운드
    playClick() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(600, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }

    // 에러/실패 사운드
    playError() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // 보너스/코인 획득 사운드
    playBonus() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager();
