// チーム種別
const TEAM = {
		INVALID	: "INVALID",	// チーム未選択
		SPRING	: "SPRING",		// 春チーム
		SUMMER	: "SUMMER",		// 夏チーム
		AUTUMN	: "AUTUMN",		// 秋チーム
		WINTER	: "WINTER"		// 冬チーム
}

// チームのロゴ情報
const TEAM_LOGO = [
	{ key: TEAM.SPRING, view:"春", image: './img/spring.png', color: 'rgb(202, 235, 190)' },
	{ key: TEAM.SUMMER, view:"夏", image: './img/summer.png', color: 'rgb(194, 215, 233)' },
	{ key: TEAM.AUTUMN, view:"秋", image: './img/autumn.png', color: 'rgb(255, 225, 169)' },
	{ key: TEAM.WINTER, view:"冬", image: './img/winter.png', color: 'rgb(243, 199, 199)' }
];
