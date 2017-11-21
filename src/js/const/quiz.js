/**
 * クイズのステータス
 */
const QUIZ_STATUS = {
  READY:"READY",//準備中
  RUNNING:"RUNNING",//実行中
  FINISH:"FINISH",//完了
  RESULT_OPENED:"RESULT_OPENED"//結果発表済み
}

/**
 * クイズデータ
 */
const QUIZ_DATA = [
	{ // 第１問
		limitSec: 15,
		question: {
			question: "NST社員は男性より女性が多い。",
			selections: [
				{ symbol: "〇", label: "女性が多い", isCorrect: false },
				{ symbol: "×", label: "男性が多い", isCorrect: true }
			],
			comment: "スマホシステムの利用方法を確認して貰うためサービス問題です"
		}
	},
	{ // 第２問
		limitSec: 15,
		question: {
			question: "NSTアンケートより、お金と時間どちらがほしいか。の質問に対し、お金が多かった。",
			selections: [
				{ symbol: "〇", label: "お金が多かった", isCorrect: true },
				{ symbol: "×", label: "時間が多かった", isCorrect: false }
			],
			comment: ""
		}

	},
	{ // 第３問
		limitSec: 15,
		question: {
			question: "NSTアンケートより、【AJITEC時代に入社した方へご質問】横浜と川崎、どちらが良かったですか？の質問に対し、横浜が多かった。",
			selections: [
				{ symbol: "〇", label: "横浜が多かった", isCorrect: false },
				{ symbol: "×", label: "横浜が少なかった", isCorrect: true }
			],
			comment: ""
		}
	},
	{ // 第４問
		limitSec: 15,
		question: {
			question: "あなたの好きなテレビ番組を教えて下さい。の質問に対し、お笑いが一番多かった。",
			selections: [
				{ symbol: "〇", label: "お笑いが多かった", isCorrect: true },
				{ symbol: "×", label: "お笑いが少なかった", isCorrect: false }
			],
			comment: ""
		}
	},
	{ // 第５問
		limitSec: 15,
		question: {
			question: "NSTアンケートより、個人携帯は何を使っていますか？の質問に対し、iPhoneが多かった。",
			selections: [
				{ symbol: "〇", label: "iPhoneが多かった", isCorrect: true },
				{ symbol: "×", label: "iPhoneが少なかった", isCorrect: false }
			],
			comment: ""
		}
	},
	{ // 第６問
		limitSec: 15,
		question: {
			question: "NACの名称は「Active support for Career development of, by and for myself」である。",
			selections: [
				{ symbol: "〇", label: "正しい", isCorrect: false },
				{ symbol: "×", label: "正しくない", isCorrect: true }
			],
			comment: "正しくは、「～～yourself」でした"
		}

	},
	{ // 第７問
		limitSec: 15,
		question: {
			question: "宝くじ最大いくら買ったことがありますか？で、20万円以上購入した人は　いない。",
			selections: [
				{ symbol: "〇", label: "いる", isCorrect: false },
				{ symbol: "×", label: "いない", isCorrect: true }
			],
			comment: "いる"
		}
	},
	{ // 第８問
		limitSec: 15,
		question: {
			question: "NSTアンケートより、今の職業を選んでいなかったら、どんな職業についていたかったですか？の質問に対し、4つの中で、どれも選ばれなかったのはどれか。",
			selections: [
				{ symbol: "A", label: "ホームレス", isCorrect: false },
				{ symbol: "B", label: "冒険家", isCorrect: false },
				{ symbol: "C", label: "ウルトラマン", isCorrect: true },
				{ symbol: "D", label: "フリーター", isCorrect: false }
			],
			comment: ""
		}

	},
	{ // 第９問
		limitSec: 15,
		question: {
			question: "NSTアンケートより、あなたの誕生月を教えて下さい。の質問に対し、4つの中で、１番多かった月はどれか。",
			selections: [
				{ symbol: "A", label: "１月", isCorrect: false },
				{ symbol: "B", label: "２月", isCorrect: false },
				{ symbol: "C", label: "８月", isCorrect: false },
				{ symbol: "D", label: "１０月", isCorrect: true }
			],
			comment: ""
		}
	},
	{ // 第１０問
		limitSec: 15,
		question: {
			question: "NSTアンケートより、YBP周辺（天王町・保土ヶ谷）のランチで一番おすすめの店はどこですか？。の質問に対し、4つの中で、３番に多かった店はどれか。",
			selections: [
				{ symbol: "A", label: "やきとりの拓", isCorrect: false },
				{ symbol: "B", label: "八珍", isCorrect: true },
				{ symbol: "C", label: "あまんじゃく", isCorrect: false },
				{ symbol: "D", label: "モンテファーレ", isCorrect: false }
			],
			comment: "1位、2位は同一票で「あまんじゃく」、「やきとりの拓」、四番は「モンテファーレ」でした"
		}
	},
];
