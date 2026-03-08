const requiredMajor = Number(process.argv[2] || 22);
const currentVersion = process.versions.node;
const currentMajor = Number(currentVersion.split(".")[0]);

if (Number.isNaN(requiredMajor)) {
  console.error("Node 버전 검사 설정이 잘못되었습니다.");
  process.exit(1);
}

if (currentMajor !== requiredMajor) {
  console.error(
    [
      `지원되지 않는 Node 버전입니다. 현재: v${currentVersion}`,
      `이 작업은 Node ${requiredMajor}.x 환경에서 실행해야 합니다.`,
      "루트의 .nvmrc 또는 README.md의 개발 환경 안내를 확인한 뒤 다시 실행하세요.",
    ].join("\n")
  );
  process.exit(1);
}
