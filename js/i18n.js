// =============================================
//  ことば（日本語・English・繁體中文・한국어）
//  ===========================================

(function () {
  var LANGS = ['ja', 'en', 'zh', 'ko'];
  var KEY = 'batbey-lang';
  var D = {
 "lang_label": [
  "ことば",
  "Language",
  "語言",
  "언어"
 ],
 "home": [
  "なすびのお庭へ",
  "Nasubi's Garden (more games)",
  "前往茄子的庭院",
  "가지의 정원으로"
 ],
 "howto": [
  "あそびかた",
  "How to play",
  "玩法",
  "플레이 방법"
 ],
 "close": [
  "とじる",
  "Close",
  "關閉",
  "닫기"
 ],
 "back": [
  "もどる",
  "Back",
  "返回",
  "돌아가기"
 ],
 "to_title": [
  "タイトルへ",
  "Back to title",
  "回到標題",
  "타이틀로"
 ],
 "again": [
  "もう一回",
  "Play again",
  "再來一局",
  "한 판 더"
 ],
 "easy": [
  "よわい",
  "Easy",
  "簡單",
  "약함"
 ],
 "normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "hard": [
  "つよい",
  "Hard",
  "困難",
  "강함"
 ],
 "vs_cpu": [
  "CPUとたいせん",
  "VS CPU",
  "對戰CPU",
  "CPU와 대전"
 ],
 "online": [
  "あいことばで対戦",
  "Play with a passcode",
  "用暗號對戰",
  "암호로 대전"
 ],
 "passcode": [
  "あいことば",
  "Passcode",
  "暗號",
  "암호"
 ],
 "name": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "noname": [
  "ななし",
  "Anonymous",
  "無名氏",
  "익명"
 ],
 "online_hint": [
  "同じあいことばを入れた人と対戦。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 관전이 됩니다."
 ],
 "join": [
  "はいる",
  "Join",
  "進入",
  "입장"
 ],
 "wait_pre": [
  "あいことば「",
  "Passcode: ",
  "暗號「",
  "암호 「"
 ],
 "wait_post": [
  "」",
  "",
  "」",
  "」"
 ],
 "waiting": [
  "あいてを待っています…",
  "Waiting for an opponent…",
  "等待對手中…",
  "상대를 기다리는 중…"
 ],
 "copy_link": [
  "さそうリンクをコピー",
  "Copy invite link",
  "複製邀請連結",
  "초대 링크 복사"
 ],
 "copied": [
  "コピーしました！",
  "Copied!",
  "已複製！",
  "복사했어요!"
 ],
 "send_link": [
  "このリンクを送ってください",
  "Send this link",
  "請傳送這個連結",
  "이 링크를 보내 주세요"
 ],
 "err_code": [
  "あいことばを入れてください（. # $ / [ ] は使えません）",
  "Enter a passcode (. # $ / [ ] are not allowed)",
  "請輸入暗號（不能使用 . # $ / [ ]）",
  "암호를 입력해 주세요 (. # $ / [ ] 는 사용할 수 없어요)"
 ],
 "err_code_short": [
  "あいことばを入れてください",
  "Enter a passcode",
  "請輸入暗號",
  "암호를 입력해 주세요"
 ],
 "connecting": [
  "つないでいます…",
  "Connecting…",
  "連線中…",
  "연결 중…"
 ],
 "err_net": [
  "通信できませんでした。電波のよいところでもう一度ためしてください",
  "Couldn't connect. Please try again where the signal is better.",
  "無法連線。請在訊號好的地方再試一次。",
  "연결하지 못했어요. 신호가 좋은 곳에서 다시 시도해 주세요."
 ],
 "err_notready": [
  "オンライン対戦はまだ準備中です",
  "Online play isn't ready yet",
  "線上對戰還在準備中",
  "온라인 대전은 아직 준비 중이에요"
 ],
 "err_conn": [
  "つながりませんでした",
  "Couldn't connect",
  "無法連線",
  "연결되지 않았어요"
 ],
 "left_win": [
  "相手が抜けたので、あなたの勝ち！",
  "Your opponent left, so you win!",
  "對手離開了，你贏了！",
  "상대가 나가서 당신의 승리!"
 ],
 "left": [
  "あいてが退室しました",
  "Your opponent left",
  "對手已離開",
  "상대가 퇴장했어요"
 ],
 "watch_in": [
  "観戦で入りました。試合が始まるのを待っています…",
  "You joined as a spectator. Waiting for the game to start…",
  "已用觀戰身分進入。等待比賽開始…",
  "관전으로 입장했어요. 경기 시작을 기다리는 중…"
 ],
 "wait_next": [
  "次の試合が始まるのを待っています…",
  "Waiting for the next game…",
  "等待下一局開始…",
  "다음 경기를 기다리는 중…"
 ],
 "wait_rematch": [
  "あいての「もう一回」を待っています…",
  "Waiting for your opponent to choose \"Play again\"…",
  "等待對手按「再來一局」…",
  "상대의 '한 판 더'를 기다리는 중…"
 ],
 "you": [
  "あなた",
  "You",
  "你",
  "나"
 ],
 "cpu": [
  "CPU",
  "CPU",
  "CPU",
  "CPU"
 ],
 "your_turn": [
  "あなたの番",
  "Your turn",
  "輪到你",
  "내 차례"
 ],
 "cpu_wait_label": [
  "CPU（ふつう）と遊びながら待つ",
  "Play the CPU (Normal) while waiting",
  "一邊和CPU（普通）玩一邊等",
  "기다리는 동안 CPU(보통)와 플레이"
 ],
 "qm_btn": [
  "だれかと対戦",
  "Play someone online",
  "隨機對戰",
  "아무나와 대전"
 ],
 "qm_stat": [
  "対戦待ち <b>{w}</b>人・対戦中 <b>{p}</b>組",
  "<b>{w}</b> waiting · <b>{p}</b> playing",
  "等待中 <b>{w}</b>人・對戰中 <b>{p}</b>組",
  "대기 <b>{w}</b>명 · 대전 중 <b>{p}</b>쌍"
 ],
 "qm_prime_hot": [
  "🔥 いま対戦タイム！（22時まで）",
  "🔥 Battle time now! (until 22:00 JST)",
  "🔥 現在是對戰時間！（到日本時間22點）",
  "🔥 지금은 대전 타임! (일본 시간 22시까지)"
 ],
 "qm_prime": [
  "🌙 毎晩21時〜22時は対戦タイム",
  "🌙 Battle time every night 21:00–22:00 JST",
  "🌙 每晚日本時間21〜22點是對戰時間",
  "🌙 매일 밤 일본 시간 21~22시는 대전 타임"
 ],
 "qm_sub": [
  "いま待っている人と、自動でつながります。",
  "You'll be matched automatically with someone who's waiting.",
  "自動和正在等待的人配對。",
  "기다리고 있는 사람과 자동으로 연결돼요."
 ],
 "qm_go": [
  "さがす",
  "Find a match",
  "尋找",
  "찾기"
 ],
 "qm_badname": [
  "その名前は使えません。ほかの名前にしてね",
  "That name can't be used. Please choose another.",
  "這個名字不能使用，請換一個。",
  "그 이름은 사용할 수 없어요. 다른 이름으로 해 주세요."
 ],
 "qm_searching": [
  "相手をさがしています",
  "Looking for an opponent",
  "正在尋找對手",
  "상대를 찾는 중"
 ],
 "qm_wait_pre": [
  "いま対戦待ち ",
  "Waiting now: ",
  "目前等待中 ",
  "현재 대기 "
 ],
 "qm_wait_post": [
  "人",
  "",
  "人",
  "명"
 ],
 "qm_cpu": [
  "CPUと遊びながら待つ",
  "Play the CPU while waiting",
  "一邊和CPU玩一邊等",
  "기다리는 동안 CPU와 플레이"
 ],
 "qm_cancel": [
  "やめる",
  "Cancel",
  "取消",
  "그만두기"
 ],
 "qm_retry": [
  "もう一度さがす",
  "Search again",
  "再找一次",
  "다시 찾기"
 ],
 "qm_searching_t": [
  "相手をさがしています… {t}",
  "Looking for an opponent… {t}",
  "正在尋找對手… {t}",
  "상대를 찾는 중… {t}"
 ],
 "qm_calling": [
  "CPUと遊んでいる人に声をかけています…",
  "Inviting someone who is playing the CPU…",
  "正在邀請正在和CPU玩的人…",
  "CPU와 플레이 중인 사람에게 신청하는 중…"
 ],
 "qm_declined": [
  "相手が見送りました。ほかの人をさがします",
  "They passed. Looking for someone else.",
  "對方跳過了，改找其他人。",
  "상대가 넘겼어요. 다른 사람을 찾을게요."
 ],
 "qm_found": [
  "相手が見つかりました！",
  "Opponent found!",
  "找到對手了！",
  "상대를 찾았어요!"
 ],
 "qm_avail": [
  "対戦できる相手がいます！",
  "Someone is ready to play!",
  "有可以對戰的對手！",
  "대전할 수 있는 상대가 있어요!"
 ],
 "qm_play": [
  "対戦する",
  "Play",
  "對戰",
  "대전하기"
 ],
 "qm_pass": [
  "見送る",
  "Pass",
  "跳過",
  "넘기기"
 ],
 "qm_taken": [
  "さっきの相手は、ほかの人と対戦を始めました。もう少し待ってね",
  "That player started a match with someone else. Please wait a little longer.",
  "剛才的對手已經和別人開始對戰了。請再等一下。",
  "방금 상대는 다른 사람과 대전을 시작했어요. 조금만 더 기다려 주세요."
 ],
 "qm_fail": [
  "相手とつながりませんでした（{c}）",
  "Couldn't connect to your opponent ({c})",
  "無法和對手連線（{c}）",
  "상대와 연결되지 않았어요 ({c})"
 ],
 "qm_nojoin": [
  "入れませんでした",
  "Couldn't join",
  "無法進入",
  "들어가지 못했어요"
 ],
 "qm_next": [
  "次の相手をさがす",
  "Find next opponent",
  "尋找下一位對手",
  "다음 상대 찾기"
 ],
 "doc_title": [
  "バトベイ",
  "Batbey",
  "對戰陀螺",
  "배트베이"
 ],
 "doc_desc": [
  "自分で描いたコマで戦う、3Dバトルごま。形が当たり判定、ポイント配分で強さが決まる。あいことば対戦・観戦・60秒らくがきバトルも。",
  "A 3D battle-top game where you fight with a top you drew yourself. Its shape is its hitbox, and points set its strength. Passcode battles, spectating, and 60-second doodle battles.",
  "用自己畫的陀螺對戰的3D戰鬥陀螺。畫的形狀就是碰撞範圍，點數分配決定強度。還有暗號對戰、觀戰、60秒塗鴉對戰。",
  "내가 그린 팽이로 싸우는 3D 배틀팽이. 모양이 곧 판정, 포인트 배분으로 강함이 정해져요. 암호 대전·관전·60초 낙서 배틀도."
 ],
 "logo": [
  "<span>バト</span>ベイ",
  "<span>BAT</span>BEY",
  "<span>對戰</span>陀螺",
  "<span>배트</span>베이"
 ],
 "tag": [
  "描いて、回して、ぶつけあえ。",
  "Draw it. Spin it. Smash it.",
  "畫出來、轉起來、撞過去！",
  "그리고, 돌리고, 부딪쳐라!"
 ],
 "home_e": [
  "🍆 なすびのお庭へ",
  "🍆 Nasubi's Garden (more games)",
  "🍆 前往茄子的庭院",
  "🍆 가지의 정원으로"
 ],
 "no_top": [
  "まだコマがありません",
  "No top yet",
  "還沒有陀螺",
  "아직 팽이가 없어요"
 ],
 "make_top": [
  "コマをつくる",
  "Make a top",
  "做陀螺",
  "팽이 만들기"
 ],
 "edit_top": [
  "コマをなおす",
  "Edit top",
  "修改陀螺",
  "팽이 고치기"
 ],
 "noname_top": [
  "なまえなし",
  "No name",
  "未命名",
  "이름 없음"
 ],
 "id_c": [
  "ID：",
  "ID: ",
  "ID：",
  "ID: "
 ],
 "copy": [
  "コピー",
  "Copy",
  "複製",
  "복사"
 ],
 "copied2": [
  "コピーしました",
  "Copied",
  "已複製",
  "복사했어요"
 ],
 "id_again": [
  "もう一度IDをもらう",
  "Get a new ID",
  "重新取得ID",
  "ID 다시 받기"
 ],
 "find_btn": [
  "IDでよぶ",
  "Load by ID",
  "用ID叫出",
  "ID로 부르기"
 ],
 "gal_btn": [
  "みんなのコマ",
  "Everyone's tops",
  "大家的陀螺",
  "모두의 팽이"
 ],
 "q_label": [
  "画質：",
  "Quality: ",
  "畫質：",
  "화질: "
 ],
 "q_auto": [
  "おまかせ",
  "Auto",
  "自動",
  "자동"
 ],
 "q_hi": [
  "きれい",
  "High",
  "高",
  "높음"
 ],
 "q_lo": [
  "かるい",
  "Light",
  "輕量",
  "가벼움"
 ],
 "q_toast": [
  "画質：{q}（切りかえます）",
  "Quality: {q} (reloading)",
  "畫質：{q}（切換中）",
  "화질: {q} (전환합니다)"
 ],
 "q_auto_low": [
  "動きが重いので、次から画質を「かるい」にします",
  "Running slowly, so quality will be \"Light\" from next time",
  "畫面有點卡，下次起畫質改為「輕量」",
  "움직임이 무거워서 다음부터 화질을 \"가벼움\"으로 할게요"
 ],
 "snd_label": [
  "音：",
  "Sound: ",
  "音效：",
  "소리: "
 ],
 "snd_on": [
  "あり",
  "On",
  "開",
  "켜짐"
 ],
 "snd_off": [
  "なし",
  "Off",
  "關",
  "꺼짐"
 ],
 "make_first": [
  "まずはコマをつくろう！",
  "Make your top first!",
  "先來做陀螺吧！",
  "먼저 팽이를 만들자!"
 ],
 "rival": [
  "ライバル",
  "Rival",
  "對手",
  "라이벌"
 ],
 "cpu_name": [
  "{name}（{lv}）",
  "{name} ({lv})",
  "{name}（{lv}）",
  "{name} ({lv})"
 ],
 "draw_title": [
  "コマを描く",
  "Draw your top",
  "畫陀螺",
  "팽이 그리기"
 ],
 "next": [
  "つぎへ",
  "Next",
  "下一步",
  "다음"
 ],
 "fit": [
  "全体",
  "Fit",
  "全部",
  "전체"
 ],
 "sample": [
  "見本を出す",
  "Load a sample",
  "顯示範例",
  "견본 불러오기"
 ],
 "clear_all": [
  "全部消す",
  "Erase all",
  "全部清除",
  "모두 지우기"
 ],
 "t_pen": [
  "ペン",
  "Pen",
  "筆",
  "펜"
 ],
 "t_fill": [
  "ぬる",
  "Fill",
  "填色",
  "채우기"
 ],
 "t_erase": [
  "けす",
  "Erase",
  "擦掉",
  "지우개"
 ],
 "t_shape": [
  "図形",
  "Shape",
  "圖形",
  "도형"
 ],
 "t_stamp": [
  "スタンプ",
  "Stamp",
  "貼圖",
  "스탬프"
 ],
 "t_undo": [
  "もどす",
  "Undo",
  "復原",
  "되돌리기"
 ],
 "size": [
  "ふとさ",
  "Size",
  "粗細",
  "굵기"
 ],
 "sym_n": [
  "{n}回対称",
  "Sym ×{n}",
  "{n}重對稱",
  "{n}회 대칭"
 ],
 "sym_off": [
  "対称なし",
  "No sym",
  "不對稱",
  "대칭 없음"
 ],
 "sym_toast": [
  "{n}回対称：描いたものが{n}つにふえる",
  "Symmetry ×{n}: what you draw is repeated {n} times",
  "{n}重對稱：畫的東西會變成{n}個",
  "{n}회 대칭: 그린 것이 {n}개로 늘어나요"
 ],
 "fill_pct": [
  "ぬり {p}%",
  "Filled {p}%",
  "填色 {p}%",
  "채움 {p}%"
 ],
 "fill_ok": [
  "　OK",
  " OK",
  "　OK",
  " OK"
 ],
 "fill_need": [
  "（{m}%で完成）",
  " (done at {m}%)",
  "（{m}%即可完成）",
  " ({m}%면 완성)"
 ],
 "fill_more": [
  "もう少しぬってね（円の{m}%以上・真ん中とつながった所）",
  "Fill in a bit more (at least {m}% of the circle, connected to the center)",
  "再多塗一點（圓的{m}%以上、和中心相連的部分）",
  "조금 더 칠해 줘 (원의 {m}% 이상, 가운데와 이어진 곳)"
 ],
 "sh_line": [
  "／ 直線",
  "／ Line",
  "／ 直線",
  "／ 직선"
 ],
 "sh_circle": [
  "○ 丸",
  "○ Circle",
  "○ 圓形",
  "○ 원"
 ],
 "sh_rect": [
  "□ 四角",
  "□ Square",
  "□ 方形",
  "□ 사각형"
 ],
 "sh_tri": [
  "△ 三角",
  "△ Triangle",
  "△ 三角形",
  "△ 삼각형"
 ],
 "sh_fill": [
  "中もぬる",
  "Filled",
  "內部填色",
  "안도 칠하기"
 ],
 "st_star": [
  "⭐ 星",
  "⭐ Star",
  "⭐ 星星",
  "⭐ 별"
 ],
 "st_heart": [
  "❤ ハート",
  "❤ Heart",
  "❤ 愛心",
  "❤ 하트"
 ],
 "st_bolt": [
  "⚡ いなずま",
  "⚡ Bolt",
  "⚡ 閃電",
  "⚡ 번개"
 ],
 "st_eyes": [
  "👀 目",
  "👀 Eyes",
  "👀 眼睛",
  "👀 눈"
 ],
 "st_tsuri": [
  "😠 つり目",
  "😠 Angry eyes",
  "😠 吊眼",
  "😠 치켜뜬 눈"
 ],
 "st_kiba": [
  "🦷 キバ",
  "🦷 Fangs",
  "🦷 獠牙",
  "🦷 송곳니"
 ],
 "st_flame": [
  "🔥 ほのお",
  "🔥 Flame",
  "🔥 火焰",
  "🔥 불꽃"
 ],
 "st_dot": [
  "● 丸",
  "● Dot",
  "● 圓點",
  "● 점"
 ],
 "back_draw": [
  "絵にもどる",
  "Back to drawing",
  "回到繪圖",
  "그림으로"
 ],
 "done": [
  "完成！",
  "Done!",
  "完成！",
  "완성!"
 ],
 "top_name": [
  "コマの名前",
  "Top name",
  "陀螺名字",
  "팽이 이름"
 ],
 "name_ph": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "su_pts": [
  "ポイント配分",
  "Points",
  "點數分配",
  "포인트 배분"
 ],
 "left_l": [
  "のこり",
  "left",
  "剩餘",
  "남음"
 ],
 "su_axis": [
  "軸",
  "Tip",
  "軸",
  "축"
 ],
 "su_lock": [
  "ロックの固さ <small>（固い＝バーストしにくいが、回転が落ちやすい）</small>",
  "Lock <small>(tight = bursts less, but loses spin faster)</small>",
  "鎖定強度 <small>（越緊＝不易爆裂，但轉速掉得快）</small>",
  "록 강도 <small>(단단할수록 버스트가 적지만 회전이 빨리 떨어짐)</small>"
 ],
 "loose_l": [
  "ゆるい",
  "Loose",
  "鬆",
  "느슨"
 ],
 "tight_l": [
  "かたい",
  "Tight",
  "緊",
  "단단"
 ],
 "su_spin": [
  "回る向き",
  "Spin direction",
  "旋轉方向",
  "도는 방향"
 ],
 "spin_r": [
  "右回り ↻",
  "Right ↻",
  "右旋 ↻",
  "오른쪽 ↻"
 ],
 "spin_l": [
  "左回り ↺",
  "Left ↺",
  "左旋 ↺",
  "왼쪽 ↺"
 ],
 "spin_r0": [
  "右回り",
  "right spin",
  "右旋",
  "오른쪽 회전"
 ],
 "spin_l0": [
  "左回り",
  "left spin",
  "左旋",
  "왼쪽 회전"
 ],
 "su_skill": [
  "スキル <small>（ぶつかるとたまる。1回戦に1回）</small>",
  "Skill <small>(charges when you collide; once per round)</small>",
  "技能 <small>（碰撞時累積，每回合1次）</small>",
  "스킬 <small>(부딪치면 충전, 한 판에 1번)</small>"
 ],
 "pt_atk": [
  "攻撃",
  "Attack",
  "攻擊",
  "공격"
 ],
 "pt_def": [
  "防御",
  "Defense",
  "防禦",
  "방어"
 ],
 "pt_sta": [
  "持久",
  "Stamina",
  "持久",
  "지구력"
 ],
 "pt_wgt": [
  "重さ",
  "Weight",
  "重量",
  "무게"
 ],
 "shape_l": [
  "形：",
  "Shape: ",
  "形狀：",
  "모양: "
 ],
 "sh_spiky": [
  "とげとげ（攻撃むき・回転は落ちやすい）",
  "spiky (good for attack, loses spin faster)",
  "尖刺（適合攻擊，轉速容易掉）",
  "뾰족뾰족 (공격형, 회전이 잘 떨어짐)"
 ],
 "sh_bumpy": [
  "でこぼこ（バランス）",
  "bumpy (balanced)",
  "凹凸（平衡）",
  "울퉁불퉁 (밸런스)"
 ],
 "sh_round": [
  "まるい（防御・持久むき）",
  "round (good for defense & stamina)",
  "圓形（適合防禦、持久）",
  "동글동글 (방어·지구력형)"
 ],
 "sh_small": [
  "／小さめ",
  " / small",
  "／偏小",
  " / 작은 편"
 ],
 "sh_big": [
  "／大きめ",
  " / large",
  "／偏大",
  " / 큰 편"
 ],
 "ax_atk": [
  "攻撃型",
  "Attack",
  "攻擊型",
  "공격형"
 ],
 "ax_bal": [
  "バランス型",
  "Balance",
  "平衡型",
  "밸런스형"
 ],
 "ax_sta": [
  "持久型",
  "Stamina",
  "持久型",
  "지구형"
 ],
 "axd_atk": [
  "よく動き回って、ぶつかりに行く",
  "Roams around and charges in",
  "到處亂跑，主動去撞",
  "많이 돌아다니며 부딪치러 감"
 ],
 "axd_bal": [
  "ほどよく動いて、ほどよく粘る",
  "Moves some, holds on some",
  "適度移動、適度撐住",
  "적당히 움직이고 적당히 버팀"
 ],
 "axd_sta": [
  "真ん中でじっと、長く回る",
  "Stays in the middle, spins long",
  "待在中間，轉得久",
  "가운데서 가만히 오래 돎"
 ],
 "sk_rush": [
  "突進",
  "Rush",
  "衝刺",
  "돌진"
 ],
 "skd_rush": [
  "相手にまっすぐ体当たり",
  "Charge straight at the opponent",
  "直直撞向對手",
  "상대에게 곧장 몸통 박치기"
 ],
 "sk_wall": [
  "鉄壁",
  "Iron Wall",
  "鐵壁",
  "철벽"
 ],
 "skd_wall": [
  "数秒間、重くなる",
  "Heavier for a few seconds",
  "幾秒內變重",
  "몇 초 동안 무거워짐"
 ],
 "sk_heal": [
  "回復",
  "Recover",
  "回復",
  "회복"
 ],
 "skd_heal": [
  "回転が少し戻る",
  "Regain some spin",
  "轉速恢復一些",
  "회전이 조금 돌아옴"
 ],
 "sk_drain": [
  "吸収",
  "Drain",
  "吸收",
  "흡수"
 ],
 "skd_drain": [
  "当たるたびに相手の回転をうばう",
  "Steal spin on every hit",
  "每次碰撞都搶走對手的轉速",
  "부딪칠 때마다 상대 회전을 빼앗음"
 ],
 "sk_grav": [
  "重力",
  "Gravity",
  "重力",
  "중력"
 ],
 "skd_grav": [
  "相手の動きを遅くする",
  "Slow down the opponent",
  "讓對手變慢",
  "상대 움직임을 느리게 함"
 ],
 "sk_loose": [
  "ゆるめ",
  "Loosen",
  "鬆動",
  "풀기"
 ],
 "skd_loose": [
  "相手のロックを大きくゆるめる",
  "Greatly loosen the opponent's lock",
  "大幅鬆開對手的鎖定",
  "상대의 록을 크게 풀어 버림"
 ],
 "sk_boost": [
  "加速",
  "Boost",
  "加速",
  "가속"
 ],
 "skd_boost": [
  "数秒間、スピードが上がる",
  "Faster for a few seconds",
  "幾秒內速度變快",
  "몇 초 동안 빨라짐"
 ],
 "sk_refl": [
  "反射",
  "Reflect",
  "反射",
  "반사"
 ],
 "skd_refl": [
  "次の一撃をはね返す",
  "Bounce back the next hit",
  "反彈下一次攻擊",
  "다음 일격을 튕겨 냄"
 ],
 "stg_std": [
  "スタンダード",
  "Standard",
  "標準",
  "스탠다드"
 ],
 "stgd_std": [
  "出口が3つ＋加速レール。攻撃型がかっとぶ",
  "3 exits + boost rail. Attack types fly",
  "3個出口＋加速軌道。攻擊型會飛衝",
  "출구 3개 + 가속 레일. 공격형이 질주"
 ],
 "stg_deep": [
  "ふかすりばち",
  "Deep Bowl",
  "深碗",
  "깊은 사발"
 ],
 "stgd_deep": [
  "かべが高く場外なし。当たりが重く、バーストしやすい",
  "High walls, no ring-outs. Heavy hits, easy bursts",
  "牆高、沒有場外。撞擊重、容易爆裂",
  "벽이 높아 장외 없음. 충돌이 무겁고 버스트가 잘 남"
 ],
 "stg_flat": [
  "ひらば",
  "Flatland",
  "平地",
  "평지"
 ],
 "stgd_flat": [
  "かべが低く、はじき出しやすい。攻撃型むき",
  "Low walls, easy ring-outs. Good for attack types",
  "牆低、容易撞出場外。適合攻擊型",
  "벽이 낮아 튕겨 내기 쉬움. 공격형에 유리"
 ],
 "smp_easy": [
  "まるもち",
  "Mochi",
  "麻糬",
  "찹쌀떡"
 ],
 "smp_normal": [
  "ミツバ",
  "Trefoil",
  "三葉",
  "세잎"
 ],
 "smp_hard": [
  "ギザリュウ",
  "Jag Dragon",
  "鋸齒龍",
  "톱니룡"
 ],
 "quit": [
  "やめる",
  "Quit",
  "結束",
  "그만두기"
 ],
 "final_tag": [
  "スピン勝負！",
  "Spin showdown!",
  "旋轉對決！",
  "스핀 승부!"
 ],
 "tap_hint": [
  "タップで応援（スキルがたまる）／黄色い輪が重なる瞬間にタップで<b>会心</b>！",
  "Tap to cheer (charges your skill) / Tap when the yellow rings meet for a <b>critical</b>!",
  "點擊加油（累積技能）／黃色圓圈重疊的瞬間點擊就是<b>會心一擊</b>！",
  "탭하면 응원 (스킬 충전) / 노란 고리가 겹치는 순간 탭하면 <b>회심</b>!"
 ],
 "aim_tip": [
  "左右にドラッグで、打ち出す向き",
  "Drag left/right to aim",
  "左右拖曳決定發射方向",
  "좌우로 드래그해서 발사 방향"
 ],
 "watching": [
  "観戦中",
  "Watching",
  "觀戰中",
  "관전 중"
 ],
 "hold": [
  "長押しで<br>ためる",
  "Hold to<br>charge",
  "長按<br>蓄力",
  "길게 눌러<br>충전"
 ],
 "skill": [
  "スキル",
  "Skill",
  "技能",
  "스킬"
 ],
 "j_early": [
  "フライング！",
  "False start!",
  "搶跑！",
  "플라잉!"
 ],
 "j_perfect": [
  "ナイス！",
  "Nice!",
  "漂亮！",
  "나이스!"
 ],
 "j_late": [
  "おそい…",
  "Too late…",
  "太慢了…",
  "늦었다…"
 ],
 "j_over": [
  "強すぎ！ぐらつく",
  "Too strong! Wobbly",
  "太用力！會晃",
  "너무 세! 흔들려"
 ],
 "j_weak": [
  "よわい…",
  "Weak…",
  "太弱了…",
  "약해…"
 ],
 "j_good": [
  "いい感じ",
  "Good",
  "不錯",
  "좋아"
 ],
 "why_burst": [
  "バースト！",
  "BURST!",
  "爆裂！",
  "버스트!"
 ],
 "why_out": [
  "場外！",
  "RING OUT!",
  "場外！",
  "장외!"
 ],
 "why_stop": [
  "スピンフィニッシュ",
  "SPIN FINISH",
  "轉停終結",
  "스핀 피니시"
 ],
 "why_draw": [
  "ひきわけ",
  "DRAW",
  "平手",
  "무승부"
 ],
 "go": [
  "まわせ！",
  "SPIN!",
  "轉吧！",
  "돌려라!"
 ],
 "hit2": [
  "ガキッ！",
  "Clang!",
  "鏘！",
  "깡!"
 ],
 "hit3": [
  "ガキーン！",
  "KLANG!",
  "鏘鏘！",
  "까강!"
 ],
 "hit4": [
  "ドゴォッ！",
  "BOOM!",
  "轟！",
  "쾅!"
 ],
 "grind": [
  "ギャリギャリ",
  "Grrrind",
  "嘎嘎嘎",
  "드르륵"
 ],
 "final_call": [
  "スピン勝負！ 最後まで粘れ！",
  "Spin showdown! Hang in there!",
  "旋轉對決！撐到最後！",
  "스핀 승부! 끝까지 버텨!"
 ],
 "crit_pop": [
  "会心！",
  "CRITICAL!",
  "會心！",
  "회심!"
 ],
 "crit_me": [
  "ナイス！会心の一撃！",
  "Nice! Critical hit!",
  "漂亮！會心一擊！",
  "나이스! 회심의 일격!"
 ],
 "crit_of": [
  "{name}の会心の一撃！",
  "{name}: critical hit!",
  "{name}的會心一擊！",
  "{name}의 회심의 일격!"
 ],
 "miss_pop": [
  "スキ！",
  "Opening!",
  "破綻！",
  "빈틈!"
 ],
 "miss_call": [
  "はやすぎた！ スキができた",
  "Too early! You left an opening",
  "太早了！露出破綻",
  "너무 빨랐어! 빈틈이 생겼다"
 ],
 "crack1": [
  "ピキッ",
  "Crack",
  "喀",
  "쩍"
 ],
 "crack3": [
  "ピキピキッ！",
  "Crrrack!",
  "喀喀！",
  "쩌저적!"
 ],
 "danger_me": [
  "あぶない！ バースト寸前！",
  "Danger! About to burst!",
  "危險！快爆裂了！",
  "위험! 버스트 직전!"
 ],
 "danger_of": [
  "{name}がバースト寸前！ あと一押し！",
  "{name} is about to burst! One more push!",
  "{name}快爆裂了！再推一把！",
  "{name} 버스트 직전! 한 번만 더!"
 ],
 "excl": [
  "！",
  "!",
  "！",
  "!"
 ],
 "plus_pts": [
  "{name} ＋{n}点",
  "{name} +{n} pts",
  "{name} ＋{n}分",
  "{name} +{n}점"
 ],
 "combo": [
  "連打！",
  "COMBO",
  "連擊！",
  "연타!"
 ],
 "cheer_plus": [
  "+応援",
  "+Cheer",
  "+加油",
  "+응원"
 ],
 "pushing": [
  "{name}が押している！",
  "{name} is pushing!",
  "{name}佔上風！",
  "{name} 우세!"
 ],
 "vote_title": [
  "スタジアムに投票",
  "Vote for a stadium",
  "投票選場地",
  "스타디움 투표"
 ],
 "vote_hint": [
  "2つえらんでね。票の多いスタジアムで戦う（同じならランダム）",
  "Pick 2. The stadium with more votes wins (random on a tie)",
  "選2個。在票數多的場地對戰（同票就隨機）",
  "2개를 골라 줘. 표가 많은 스타디움에서 싸워요 (같으면 랜덤)"
 ],
 "vote_btn": [
  "これで投票",
  "Vote",
  "就投這個",
  "이걸로 투표"
 ],
 "vote_watch": [
  "ふたりが投票しています…",
  "Both players are voting…",
  "兩人正在投票…",
  "두 사람이 투표하는 중…"
 ],
 "vote_wait": [
  "あいての投票を待っています…",
  "Waiting for your opponent's vote…",
  "等待對手投票…",
  "상대의 투표를 기다리는 중…"
 ],
 "stage_go": [
  "{s}で戦います！",
  "Battle in {s}!",
  "在{s}對戰！",
  "{s}에서 싸워요!"
 ],
 "stage_tie": [
  "{s}（同じ票だったので、ランダム）で戦います！",
  "Tied vote, picked at random: battle in {s}!",
  "同票隨機決定：在{s}對戰！",
  "동점이라 랜덤: {s}에서 싸워요!"
 ],
 "win_of": [
  "{name}のかち！",
  "{name} wins!",
  "{name}獲勝！",
  "{name} 승리!"
 ],
 "win": [
  "かち！",
  "You win!",
  "贏了！",
  "승리!"
 ],
 "lose": [
  "まけ…",
  "You lose…",
  "輸了…",
  "패배…"
 ],
 "keep_one": [
  "相手のコマをライバル帳に入れる",
  "Add their top to your Rivals",
  "把對手的陀螺加入對手簿",
  "상대 팽이를 라이벌 수첩에 넣기"
 ],
 "keep_both": [
  "2つともライバル帳に入れる",
  "Add both tops to your Rivals",
  "兩個都加入對手簿",
  "둘 다 라이벌 수첩에 넣기"
 ],
 "keep_done": [
  "ライバル帳に入れました（CPUの相手に出てきます）",
  "Added to Rivals (they will show up as CPU opponents)",
  "已加入對手簿（會成為CPU的對手）",
  "라이벌 수첩에 넣었어요 (CPU 상대로 나와요)"
 ],
 "keep_done2": [
  "ライバル帳に入れました",
  "Added to Rivals",
  "已加入對手簿",
  "라이벌 수첩에 넣었어요"
 ],
 "save_fail": [
  "保存できませんでした",
  "Couldn't save",
  "無法儲存",
  "저장하지 못했어요"
 ],
 "save_draw": [
  "描いたコマを保存する（IDがつく）",
  "Save your drawn top (get an ID)",
  "儲存畫好的陀螺（會有ID）",
  "그린 팽이 저장하기 (ID가 붙어요)"
 ],
 "saved": [
  "保存しました",
  "Saved",
  "已儲存",
  "저장했어요"
 ],
 "auto_watch": [
  "つぎの試合が始まると、自動で見られます",
  "The next match will show automatically",
  "下一場開始時會自動觀看",
  "다음 경기가 시작되면 자동으로 보여요"
 ],
 "mode_now": [
  "いまのコマで",
  "My top",
  "用現在的陀螺",
  "지금 팽이로"
 ],
 "mode_raku": [
  "らくがきバトル<small>60秒で描いて20秒で設定</small>",
  "Doodle battle<small>Draw 60s, set up 20s</small>",
  "塗鴉對戰<small>60秒畫、20秒設定</small>",
  "낙서 배틀<small>60초 그리기, 20초 설정</small>"
 ],
 "raku": [
  "らくがきバトル",
  "Doodle battle",
  "塗鴉對戰",
  "낙서 배틀"
 ],
 "ex_code": [
  "例：バトベイ123",
  "e.g. batbey123",
  "例如：陀螺123",
  "예: 팽이123"
 ],
 "online_note": [
  "同じあいことばを入れた人と対戦。3人目からは<b>観戦</b>（応援スタンプを送れる）。あそびかたは、さきに入った人のほうになります。",
  "Play whoever enters the same passcode. From the 3rd person on, you <b>watch</b> (and can send cheer stamps). The first person in picks the mode.",
  "和輸入相同暗號的人對戰。第3個人開始為<b>觀戰</b>（可以送加油貼圖）。玩法依先進入的人為準。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 <b>관전</b> (응원 스탬프를 보낼 수 있어요). 방식은 먼저 들어온 사람 쪽을 따라요."
 ],
 "no_top_room": [
  "この部屋は「いまのコマで」対戦です。先にコマをつくるか、IDでよんでね",
  "This room uses \"My top\". Make a top first, or load one by ID.",
  "這個房間是「用現在的陀螺」對戰。請先做陀螺，或用ID叫出。",
  "이 방은 \"지금 팽이로\" 대전이에요. 먼저 팽이를 만들거나 ID로 불러 주세요."
 ],
 "watch_n": [
  "👀 {n}人",
  "👀 {n}",
  "👀 {n}人",
  "👀 {n}명"
 ],
 "watch_in2": [
  "観戦で入りました。つぎの試合を待っています…",
  "You joined as a spectator. Waiting for the next match…",
  "已用觀戰身分進入。等待下一場…",
  "관전으로 들어왔어요. 다음 경기를 기다리는 중…"
 ],
 "code_mode": [
  "{c}（{m}）",
  "{c} ({m})",
  "{c}（{m}）",
  "{c} ({m})"
 ],
 "dw_title0": [
  "ふたりが描いています",
  "Both players are drawing",
  "兩人正在畫",
  "두 사람이 그리는 중"
 ],
 "dw_watch": [
  "ふたりがコマを描いています",
  "Both players are drawing their tops",
  "兩人正在畫陀螺",
  "두 사람이 팽이를 그리는 중"
 ],
 "dw_watch_msg": [
  "描いて、設定したら「せーの」で発表！",
  "Once they draw and set up, both are revealed at once!",
  "畫好、設定好就「預備」一起公開！",
  "그리고 설정하면 \"하나 둘\"로 공개!"
 ],
 "draw60": [
  "60秒で描こう！ そのあと20秒で設定",
  "Draw in 60 seconds! Then 20 seconds to set up",
  "60秒內畫好！之後20秒設定",
  "60초 안에 그리자! 그다음 20초 설정"
 ],
 "dw_done": [
  "できた！",
  "Done!",
  "畫好了！",
  "다 됐다!"
 ],
 "rv_ready": [
  "せーの…",
  "Ready…",
  "預備…",
  "하나, 둘…"
 ],
 "rv_go": [
  "ドン！",
  "Reveal!",
  "登登！",
  "짠!"
 ],
 "sv_title": [
  "コマにIDをつける",
  "Get an ID for your top",
  "為陀螺取得ID",
  "팽이에 ID 붙이기"
 ],
 "sv_title_raku": [
  "描いたコマを保存",
  "Save your drawn top",
  "儲存畫好的陀螺",
  "그린 팽이 저장"
 ],
 "author": [
  "作者名",
  "Author",
  "作者名",
  "작가 이름"
 ],
 "sv_pub": [
  "「みんなのコマ」に公開する",
  "Show it in \"Everyone's tops\"",
  "公開到「大家的陀螺」",
  "\"모두의 팽이\"에 공개하기"
 ],
 "sv_mine": [
  "自分のコマにする",
  "Use as my top",
  "設為自己的陀螺",
  "내 팽이로 하기"
 ],
 "sv_hint": [
  "IDを教えると、だれでもこのコマを使えます。",
  "Anyone with the ID can use this top.",
  "告訴別人ID，誰都能用這個陀螺。",
  "ID를 알려 주면 누구나 이 팽이를 쓸 수 있어요."
 ],
 "sv_ok": [
  "保存してIDをもらう",
  "Save & get ID",
  "儲存並取得ID",
  "저장하고 ID 받기"
 ],
 "sv_skip": [
  "IDなしで使う",
  "Use without an ID",
  "不取得ID直接用",
  "ID 없이 쓰기"
 ],
 "sv_nosave": [
  "保存しない",
  "Don't save",
  "不儲存",
  "저장 안 함"
 ],
 "sv_saving": [
  "保存しています…",
  "Saving…",
  "儲存中…",
  "저장하는 중…"
 ],
 "sv_fail": [
  "保存できませんでした。通信を確認してね",
  "Couldn't save. Check your connection.",
  "無法儲存。請確認網路連線。",
  "저장하지 못했어요. 통신을 확인해 주세요."
 ],
 "sv_id_l": [
  "このコマのID",
  "This top's ID",
  "這個陀螺的ID",
  "이 팽이의 ID"
 ],
 "copy_id": [
  "IDをコピー",
  "Copy ID",
  "複製ID",
  "ID 복사"
 ],
 "sv_warn": [
  "スクショかメモをしておくと、機種変更しても戻せます",
  "Take a screenshot or note it down so you can get it back on a new phone",
  "截圖或記下來，換手機也能找回來",
  "스크린샷이나 메모를 해 두면 기기를 바꿔도 되찾을 수 있어요"
 ],
 "ok": [
  "OK",
  "OK",
  "OK",
  "OK"
 ],
 "find_title": [
  "IDでコマをよぶ",
  "Load a top by ID",
  "用ID叫出陀螺",
  "ID로 팽이 부르기"
 ],
 "id_ph": [
  "英数字8文字",
  "8 letters/numbers",
  "8位英數字",
  "영문·숫자 8자"
 ],
 "call": [
  "よぶ",
  "Load",
  "叫出",
  "부르기"
 ],
 "my_ids": [
  "このスマホでつくったコマ",
  "Tops made on this device",
  "用這支手機做的陀螺",
  "이 폰에서 만든 팽이"
 ],
 "pub_mark": [
  "（公開）",
  " (public)",
  "（公開）",
  " (공개)"
 ],
 "deleted": [
  "（削除ずみ）",
  " (deleted)",
  "（已刪除）",
  " (삭제됨)"
 ],
 "id_bad": [
  "IDは英数字8文字です",
  "An ID is 8 letters/numbers",
  "ID是8位英數字",
  "ID는 영문·숫자 8자예요"
 ],
 "not_found": [
  "見つかりませんでした",
  "Not found",
  "找不到",
  "찾지 못했어요"
 ],
 "gal_title": [
  "みんなのコマ",
  "Everyone's tops",
  "大家的陀螺",
  "모두의 팽이"
 ],
 "gal_new": [
  "新しい順",
  "Newest",
  "最新",
  "최신순"
 ],
 "gal_pop": [
  "人気順",
  "Popular",
  "人氣",
  "인기순"
 ],
 "gal_more": [
  "もっと見る",
  "Show more",
  "看更多",
  "더 보기"
 ],
 "loading": [
  "読みこんでいます…",
  "Loading…",
  "載入中…",
  "불러오는 중…"
 ],
 "by": [
  "作：{a}",
  "by {a}",
  "作者：{a}",
  "작가: {a}"
 ],
 "uses": [
  "使われた {n}回",
  "Used {n}×",
  "被用了 {n}次",
  "사용 {n}회"
 ],
 "gal_empty": [
  "まだ公開されたコマがありません",
  "No public tops yet",
  "還沒有公開的陀螺",
  "아직 공개된 팽이가 없어요"
 ],
 "load_fail": [
  "読みこめませんでした",
  "Couldn't load",
  "無法載入",
  "불러오지 못했어요"
 ],
 "cd_use": [
  "自分のコマにする",
  "Use as my top",
  "設為自己的陀螺",
  "내 팽이로 하기"
 ],
 "cd_cpu": [
  "CPUの相手にして戦う",
  "Fight it as a CPU opponent",
  "當作CPU對手來對戰",
  "CPU 상대로 싸우기"
 ],
 "cd_keep": [
  "ライバル帳に入れる",
  "Add to Rivals",
  "加入對手簿",
  "라이벌 수첩에 넣기"
 ],
 "report": [
  "通報する",
  "Report",
  "檢舉",
  "신고하기"
 ],
 "reported": [
  "通報ずみ",
  "Reported",
  "已檢舉",
  "신고함"
 ],
 "report_sure": [
  "もう一度押すと通報",
  "Tap again to report",
  "再按一次就檢舉",
  "한 번 더 누르면 신고"
 ],
 "report_done": [
  "通報しました",
  "Reported",
  "已檢舉",
  "신고했어요"
 ],
 "report_fail": [
  "通報できませんでした",
  "Couldn't report",
  "無法檢舉",
  "신고하지 못했어요"
 ],
 "del_top": [
  "このコマを消す",
  "Delete this top",
  "刪除這個陀螺",
  "이 팽이 지우기"
 ],
 "del_sure": [
  "もう一度押すと消えます",
  "Tap again to delete",
  "再按一次就刪除",
  "한 번 더 누르면 지워져요"
 ],
 "del_done": [
  "コマを消しました",
  "Top deleted",
  "已刪除陀螺",
  "팽이를 지웠어요"
 ],
 "del_fail": [
  "消せませんでした",
  "Couldn't delete",
  "無法刪除",
  "지우지 못했어요"
 ],
 "cd_meta": [
  "ID {id}　作：{a}　使われた回数 {n}",
  "ID {id} · by {a} · used {n}×",
  "ID {id}　作者：{a}　被用次數 {n}",
  "ID {id} · 작가: {a} · 사용 {n}회"
 ],
 "cd_meta2": [
  "{ax}・{spin}・スキル「{sk}」",
  "{ax} · {spin} · Skill: {sk}",
  "{ax}・{spin}・技能「{sk}」",
  "{ax} · {spin} · 스킬 \"{sk}\""
 ],
 "use_done": [
  "「{name}」を自分のコマにしました",
  "\"{name}\" is now your top",
  "已將「{name}」設為自己的陀螺",
  "\"{name}\"을(를) 내 팽이로 했어요"
 ],
 "cd_need": [
  "先に自分のコマをつくるか、「自分のコマにする」をえらんでね",
  "Make your own top first, or choose \"Use as my top\"",
  "請先做自己的陀螺，或選「設為自己的陀螺」",
  "먼저 내 팽이를 만들거나 \"내 팽이로 하기\"를 골라 주세요"
 ],
 "err_prep": [
  "通信の準備ができていません",
  "Online features are not ready",
  "連線功能尚未準備好",
  "통신 준비가 되지 않았어요"
 ],
 "err_big": [
  "絵が大きすぎて保存できません（色をぬる所を少し減らしてね）",
  "The drawing is too big to save (paint a little less area)",
  "圖太大無法儲存（請減少一點塗色的地方）",
  "그림이 너무 커서 저장할 수 없어요 (칠한 곳을 조금 줄여 주세요)"
 ],
 "err_noid": [
  "IDがつくれませんでした。もう一度ためしてね",
  "Couldn't create an ID. Please try again.",
  "無法建立ID，請再試一次。",
  "ID를 만들지 못했어요. 다시 시도해 주세요."
 ],
 "gone_full": [
  "このコマは、保管庫がいっぱいになったため削除されました（長く使われていなかったコマから順に消えます）",
  "This top was removed because storage was full (tops unused the longest are removed first)",
  "這個陀螺因為保管庫滿了而被刪除（從最久沒用的陀螺開始刪除）",
  "이 팽이는 보관함이 가득 차서 삭제되었어요 (오래 안 쓴 팽이부터 지워져요)"
 ],
 "gone_del": [
  "このコマは、作った人が削除しました",
  "This top was deleted by its creator",
  "這個陀螺已被作者刪除",
  "이 팽이는 만든 사람이 삭제했어요"
 ],
 "gone_nf": [
  "そのIDのコマは見つかりませんでした（IDをたしかめてね）",
  "No top found with that ID (please check the ID)",
  "找不到這個ID的陀螺（請確認ID）",
  "그 ID의 팽이를 찾지 못했어요 (ID를 확인해 주세요)"
 ],
 "del_own": [
  "このコマは、作ったスマホからだけ消せます",
  "This top can only be deleted from the phone that made it",
  "這個陀螺只能從製作它的手機刪除",
  "이 팽이는 만든 폰에서만 지울 수 있어요"
 ],
 "del_net": [
  "消せませんでした。通信を確認して、もう一度ためしてね",
  "Couldn't delete. Check your connection and try again.",
  "無法刪除。請確認網路後再試一次。",
  "지우지 못했어요. 통신을 확인하고 다시 시도해 주세요."
 ],
 "room_full": [
  "この部屋は観戦の人でいっぱいです（10人まで）",
  "This room is full of spectators (max 10)",
  "這個房間的觀戰人數已滿（最多10人）",
  "이 방은 관전자가 가득 찼어요 (10명까지)"
 ],
 "h1": [
  "<b>コマをつくる</b>：円の中に好きな形を描きます。描いた形が、そのまま当たり判定。真ん中の軸とつながった所だけがコマになります（円の3分の1以上ぬると完成できる）。「対称」で、回転対称に描けます。",
  "<b>Make a top</b>: draw any shape inside the circle. The shape you draw is its hitbox. Only parts connected to the center axis become the top (fill at least 1/3 of the circle to finish). \"Sym\" lets you draw with rotational symmetry.",
  "<b>做陀螺</b>：在圓裡畫喜歡的形狀。畫的形狀就是碰撞範圍。只有和中心軸相連的部分會變成陀螺（塗滿圓的3分之1以上就能完成）。用「對稱」可以畫出旋轉對稱。",
  "<b>팽이 만들기</b>: 원 안에 원하는 모양을 그려요. 그린 모양이 그대로 판정이 돼요. 가운데 축과 이어진 부분만 팽이가 돼요 (원의 3분의 1 이상 칠하면 완성 가능). \"대칭\"으로 회전 대칭 그림을 그릴 수 있어요."
 ],
 "h2": [
  "<b>ポイント配分</b>：攻撃・防御・持久・重さに、合計10ポイントを振り分け（ひとつは5まで）。形でも少し変わります（とげとげ＝攻撃、まるい＝防御・持久）。見た目は攻撃型、中身は持久型…というだましもアリ。",
  "<b>Points</b>: split 10 points across Attack, Defense, Stamina and Weight (up to 5 each). The shape matters a little too (spiky = attack, round = defense/stamina). Looks like an attacker but built for stamina? Bluffing is allowed.",
  "<b>點數分配</b>：把共10點分配到攻擊、防禦、持久、重量（每項最多5點）。形狀也有一點影響（尖刺＝攻擊、圓形＝防禦・持久）。外表是攻擊型、內在是持久型…這種騙術也可以。",
  "<b>포인트 배분</b>: 공격·방어·지구력·무게에 총 10포인트를 나눠요 (하나에 5까지). 모양으로도 조금 바뀌어요 (뾰족=공격, 동글=방어·지구력). 겉은 공격형, 속은 지구형… 같은 속임수도 OK."
 ],
 "h3": [
  "<b>軸</b>：攻撃型はふちを走り回って、真ん中へつっこむ。持久型は真ん中でじっと長く回る。バランス型はその間。",
  "<b>Tip</b>: Attack types race around the rim and charge the center. Stamina types sit in the middle and spin long. Balance is in between.",
  "<b>軸</b>：攻擊型會沿著邊緣跑，再衝向中間。持久型在中間靜靜地轉很久。平衡型介於兩者之間。",
  "<b>축</b>: 공격형은 가장자리를 달리다 가운데로 돌진. 지구형은 가운데서 가만히 오래 돌아요. 밸런스형은 그 중간."
 ],
 "h4": [
  "<b>ロック</b>：固いとバーストしにくいけれど、回転が落ちやすい。",
  "<b>Lock</b>: tight means fewer bursts, but you lose spin faster.",
  "<b>鎖定</b>：越緊越不容易爆裂，但轉速掉得快。",
  "<b>록</b>: 단단하면 버스트가 잘 안 나지만 회전이 빨리 떨어져요."
 ],
 "h5": [
  "<b>回る向き</b>：同じ向きどうしは、はじきあう。逆向きどうしは、回転をうばいあう。",
  "<b>Spin direction</b>: same-direction tops knock each other away. Opposite directions steal spin from each other.",
  "<b>旋轉方向</b>：同方向會互相彈開，反方向會互搶轉速。",
  "<b>도는 방향</b>: 같은 방향끼리는 서로 튕기고, 반대 방향끼리는 회전을 빼앗아요."
 ],
 "h6": [
  "<b>回し方</b>：左右にドラッグで向きを決めて、「3・2・1・まわせ！」に合わせて長押し→離す。ゲージは<b>90%くらい</b>がいちばん安定。満タンをこえると、ぐらつきます。早く離すとフライング、ぴったりだとボーナス。",
  "<b>Launch</b>: drag left/right to aim, then hold and release on \"3, 2, 1, SPIN!\". Around <b>90%</b> on the gauge is the most stable. Going past full makes it wobble. Release too early and it's a false start; perfect timing gives a bonus.",
  "<b>發射方法</b>：左右拖曳決定方向，配合「3・2・1・轉吧！」長按→放開。量表在<b>90%左右</b>最穩定。超過滿格會搖晃。太早放開是搶跑，剛好就有加分。",
  "<b>돌리는 법</b>: 좌우로 드래그해서 방향을 정하고, \"3·2·1·돌려라!\"에 맞춰 길게 눌렀다 떼요. 게이지는 <b>90% 정도</b>가 가장 안정적. 가득을 넘기면 흔들려요. 일찍 떼면 플라잉, 딱 맞으면 보너스."
 ],
 "h7": [
  "<b>スキル</b>：ぶつかるとゲージがたまり、満タンでボタンを押すと発動（1回戦に1回）。",
  "<b>Skill</b>: the gauge charges when you collide. When full, press the button to use it (once per round).",
  "<b>技能</b>：碰撞時量表會累積，滿了按按鈕發動（每回合1次）。",
  "<b>스킬</b>: 부딪치면 게이지가 차고, 가득 차면 버튼을 눌러 발동 (한 판에 1번)."
 ],
 "h8": [
  "<b>会心の一撃</b>：コマがぶつかりそうになると、黄色い輪がちぢんでいきます。内側の輪と重なる瞬間（オレンジ色）にタップすると「会心！」で大きくはじき、バーストに近づけます。早すぎるとスキができます。連打では出ません。",
  "<b>Critical hit</b>: when the tops are about to collide, a yellow ring shrinks. Tap the moment it meets the inner ring (orange) for a \"CRITICAL!\" that knocks hard and pushes them toward a burst. Too early leaves you open. Mashing won't work.",
  "<b>會心一擊</b>：陀螺快撞上時，黃色圓圈會縮小。在和內圈重疊的瞬間（變橘色）點擊，就會「會心！」大力彈開，讓對手接近爆裂。太早會露出破綻。連點沒有用。",
  "<b>회심의 일격</b>: 팽이가 부딪치려 하면 노란 고리가 줄어들어요. 안쪽 고리와 겹치는 순간 (주황색) 탭하면 \"회심!\"으로 크게 튕겨 버스트에 가까워져요. 너무 빠르면 빈틈이 생겨요. 연타로는 안 나와요."
 ],
 "h9": [
  "<b>バースト寸前</b>：ロックがゆるむと「ピキッ」と鳴って、コマがガタガタふるえます。",
  "<b>About to burst</b>: when the lock loosens, you hear a \"crack\" and the top starts to rattle.",
  "<b>快要爆裂</b>：鎖定鬆掉時會「喀」一聲，陀螺會喀噠喀噠地抖。",
  "<b>버스트 직전</b>: 록이 풀리면 \"쩍\" 소리가 나고 팽이가 덜덜 떨려요."
 ],
 "h10": [
  "<b>応援</b>：バトル中に画面をタップすると、スキルのゲージが少したまります（1回戦にためられる量には上限あり）。",
  "<b>Cheer</b>: tapping the screen during battle charges your skill gauge a little (there is a limit per round).",
  "<b>加油</b>：對戰中點擊畫面，技能量表會累積一點（每回合有上限）。",
  "<b>응원</b>: 배틀 중에 화면을 탭하면 스킬 게이지가 조금 차요 (한 판에 모을 수 있는 양에는 한도가 있어요)."
 ],
 "h11": [
  "<b>スピン勝負</b>：ふたりとも回転が3割を切ると、残りの回転が％で出ます。最後まで目がはなせない！",
  "<b>Spin showdown</b>: when both tops drop below 30% spin, the remaining spin is shown in %. Watch till the very end!",
  "<b>旋轉對決</b>：兩人的轉速都低於3成時，會用％顯示剩下的轉速。一刻都不能放鬆！",
  "<b>스핀 승부</b>: 둘 다 회전이 30% 아래로 떨어지면 남은 회전이 %로 나와요. 끝까지 눈을 뗄 수 없어요!"
 ],
 "h12": [
  "<b>決着</b>：バースト（ばらばらに外れる）2点、場外2点、先に止まる1点。<b>3点先取</b>で勝ち。",
  "<b>Scoring</b>: Burst (falls apart) 2 pts, Ring out 2 pts, stopping first gives 1 pt to the other. <b>First to 3</b> wins.",
  "<b>勝負</b>：爆裂（散開）2分、場外2分、先停下來的對手得1分。<b>先拿3分</b>獲勝。",
  "<b>결판</b>: 버스트(산산이 분해) 2점, 장외 2점, 먼저 멈추면 상대 1점. <b>3점 선취</b>로 승리."
 ],
 "h13": [
  "<b>スタジアム</b>：戦う前に、ふたりが3つから2つ投票。票の多いところで戦う（同じならランダム）。スタンダードのふちには<b>加速レール</b>があり、攻撃型が乗ると一気に加速します。",
  "<b>Stadium</b>: before the battle, both players vote for 2 of 3. The one with more votes is used (random on a tie). Standard has a <b>boost rail</b> on its rim that sends attack types flying.",
  "<b>場地</b>：對戰前，兩人從3個裡投2個。在票多的場地對戰（同票就隨機）。標準場地的邊緣有<b>加速軌道</b>，攻擊型一上去就會猛加速。",
  "<b>스타디움</b>: 싸우기 전에 두 사람이 3개 중 2개에 투표. 표가 많은 곳에서 싸워요 (같으면 랜덤). 스탠다드 가장자리에는 <b>가속 레일</b>이 있어 공격형이 타면 단숨에 가속해요."
 ],
 "h14": [
  "<b>ID</b>：完成したコマには8文字のIDがつきます。IDを入れれば、だれでもそのコマを使えます。",
  "<b>ID</b>: a finished top gets an 8-character ID. Anyone who enters the ID can use that top.",
  "<b>ID</b>：完成的陀螺會有8位ID。輸入ID，誰都能用那個陀螺。",
  "<b>ID</b>: 완성한 팽이에는 8자 ID가 붙어요. ID를 넣으면 누구나 그 팽이를 쓸 수 있어요."
 ],
 "h15": [
  "<b>あいことば対戦</b>：「いまのコマで」か「らくがきバトル（60秒で描く＋20秒で設定）」。3人目からは観戦。",
  "<b>Passcode battle</b>: \"My top\" or \"Doodle battle\" (draw in 60s + set up in 20s). From the 3rd person on, you watch.",
  "<b>暗號對戰</b>：「用現在的陀螺」或「塗鴉對戰（60秒畫＋20秒設定）」。第3個人開始為觀戰。",
  "<b>암호 대전</b>: \"지금 팽이로\" 또는 \"낙서 배틀 (60초 그리기 + 20초 설정)\". 3번째 사람부터는 관전."
 ]
};
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.indexOf(q) >= 0) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; } } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'ja').toLowerCase();
    if (n.indexOf('ja') === 0) return 'ja'; if (n.indexOf('ko') === 0) return 'ko'; if (n.indexOf('zh') === 0) return 'zh'; return 'en';
  }
  var L = pick();
  function t(k, v) {
    var row = D[k]; var i = LANGS.indexOf(L);
    var s = row ? (row[i] != null ? row[i] : row[0]) : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  // 題字の字がないことばだけ、そのことば用のフォントを読みこむ
  var FONTS = { ko: 'Black+Han+Sans&family=Jua', zh: 'Chiron+GoRound+TC:wght@800;900' };
  function langFont() {
    var f = FONTS[L]; if (!f || document.getElementById('lf-' + L)) return;
    var l = document.createElement('link'); l.id = 'lf-' + L; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f + '&display=swap'; document.head.appendChild(l);
  }
  function apply() {
    langFont();
    var de = document.documentElement;
    de.lang = L === 'zh' ? 'zh-Hant' : L; de.setAttribute('data-lang', L);
    document.querySelectorAll('[data-i]').forEach(function (e) { e.textContent = t(e.dataset.i); });
    document.querySelectorAll('[data-ih]').forEach(function (e) { e.innerHTML = t(e.dataset.ih); });
    document.querySelectorAll('[data-ip]').forEach(function (e) { e.placeholder = t(e.dataset.ip); });
    document.querySelectorAll('[data-ia]').forEach(function (e) { e.setAttribute('aria-label', t(e.dataset.ia)); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === L ? 'true' : 'false'); });
    document.title = t('doc_title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('doc_desc'));
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: L })); } catch (e) {}
  }
  function set(l) { if (LANGS.indexOf(l) < 0) return; L = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }
  function bind() {
    document.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    apply();
  }
  window.I18N = { t: t, set: set, apply: apply, get lang() { return L; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
