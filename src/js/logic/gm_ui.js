/**
 * 各ラウンドで使う単語データ
 */
const ROUND_DATA = [
	{	// ラウンド１：最初の月のデータ
		limitSec: 60,
		aggregateCount: 15,
		roundName: '最初の月',
		words:[
			{ typing: "やたいでり", view: "屋台Deli" },
			{ typing: "あまんじゃく", view: "あまんじゃく" },
			{ typing: "ごめんや", view: "ごめんや" },
			{ typing: "とんとん", view: "とんとん" },
			{ typing: "きぶん", view: "紀文" },
			{ typing: "あらぶっふしゅん", view: "アラブッフ・シュン" },
			{ typing: "ばらのき", view: "薔薇の木" },
			{ typing: "ぐじぇーる", view: "グジェール" },
			{ typing: "やきとりのたく", view: "やきとりの拓" },
			{ typing: "とがし", view: "冨がし" },
			{ typing: "ばーがーずにゅーよーく", view: "バーガーズニューヨーク" },
			{ typing: "すぱいしーどらごん", view: "スパイシードラゴン" },
			{ typing: "とーだ", view: "トーダ" },
			{ typing: "りゅうかいかく", view: "龍海閣" },
			{ typing: "ぼんぐり", view: "ぼんぐ里" },
			{ typing: "らさこん", view: "ラ・サコン" },
			{ typing: "つるかめ", view: "ツルカメ" },
			{ typing: "えべれすときっちん", view: "エベレストキッチン" },
			{ typing: "すぱいすぷらざ", view: "スパイスプラザ" },
			{ typing: "むすかん", view: "ムスカン" },
			{ typing: "あんらくてい", view: "安楽亭" },
			{ typing: "うみふく", view: "海福" },
			{ typing: "さくら", view: "櫻" },
			{ typing: "きっちんあい", view: "キッチンアイ" },
			{ typing: "でんせつのちゅうかりょうりにん", view: "伝説の中華料理人" },
			{ typing: "うえんでぃーず", view: "ウエンディーズ" },
			{ typing: "さぼてん", view: "さぼてん" },
			{ typing: "ちゃぷちゃぷ", view: "チャプチャプ" }
		]
	},
	{	// ラウンド２：中の月のデータ
		limitSec: 60,
		aggregateCount: 15,
		roundName: '中の月',
		words: [
			{ typing: "わじょうりょうしゅ", view: "和醸良酒" },
			{ typing: "ひかりや", view: "光家" },
			{ typing: "ひまわり", view: "ひまわり" },
			{ typing: "すかいらぶ", view: "スカイラブ" },
			{ typing: "ごりあて", view: "ゴリアテ" },
			{ typing: "さくらのごとく", view: "桜の如く" },
			{ typing: "こころ", view: "こころ" },
			{ typing: "てんのうしゅか", view: "天王酒家" },
			{ typing: "らっしゅ", view: "ラッシュ" },
			{ typing: "あめりかーの", view: "アメリカーノ" },
			{ typing: "さいぜりや", view: "サイゼリヤ" },
			{ typing: "おおとや", view: "大戸屋" },
			{ typing: "いせや", view: "伊勢屋" },
			{ typing: "あーろんぽーと", view: "アーロンポート" },
			{ typing: "じゅけいろう", view: "聚慶楼" },
			{ typing: "ほどがやせんなりずし", view: "ほどがや千成鮨" },
			{ typing: "おらがそば", view: "おらが蕎麦" },
			{ typing: "もんてふぁーれ", view: "モンテファーレ" },
			{ typing: "いずあん", view: "伊豆庵" },
			{ typing: "きわみや", view: "極味家" },
			{ typing: "とりぶぎょう", view: "鶏奉行" },
			{ typing: "ほうらくえん", view: "宝楽園" },
			{ typing: "えどすし", view: "江戸寿司" },
			{ typing: "うしだる", view: "牛樽" },
			{ typing: "どうじょう", view: "道場" },
			{ typing: "まとあたり", view: "まとあたり" },
			{ typing: "ここいちばんや", view: "CoCo壱番屋" },
			{ typing: "くうかい", view: "空海" },
			{ typing: "しゃんはいはんてん", view: "上海飯店" }
		]
	},
	{	// ラウンド３：最後の月のデータ
		limitSec: 60,
		aggregateCount: 15,
		roundName: '最後の月',
		words: [
			{ typing: "せいふくえん", view: "盛福園" },
			{ typing: "うなへい", view: "うな平" },
			{ typing: "かげつ", view: "花月" },
			{ typing: "きたみ", view: "きたみ" },
			{ typing: "いちりん", view: "いちりん" },
			{ typing: "たつのき", view: "樹" },
			{ typing: "むらたや", view: "村田屋" },
			{ typing: "はっちん", view: "八珍" },
			{ typing: "ふらごーら", view: "フラゴーラ" },
			{ typing: "ちょわよ", view: "チョワヨ" },
			{ typing: "せいれん", view: "青蓮" },
			{ typing: "げん", view: "玄" },
			{ typing: "むぎまる", view: "麦まる" },
			{ typing: "とりいちもんじ", view: "とりいちもんじ" },
			{ typing: "まるふくさかば", view: "○福酒場" },
			{ typing: "まはろは", view: "マハロハ" },
			{ typing: "ほどがや", view: "ほどが家" },
			{ typing: "ひだかや", view: "日高家" },
			{ typing: "いっぴんえん", view: "一品苑" },
			{ typing: "ぶるどっく", view: "ブルドック" },
			{ typing: "うおひろ", view: "魚ひろ" },
			{ typing: "けんめり", view: "けんめり" },
			{ typing: "なかい", view: "なか井" },
			{ typing: "くしまる", view: "串まる" },
			{ typing: "ほどがやさかば", view: "ほどがや酒場" },
			{ typing: "うさぎのいるしま", view: "うさぎのいる島" },
			{ typing: "さかなやどうじょう", view: "さかなや道場" },
			{ typing: "てんのくら", view: "天の蔵" },
			{ typing: "ふくまる", view: "福○" },
			{ typing: "ぱたぱた", view: "パタパタ" },
			{ typing: "えいか", view: "栄華" },
			{ typing: "ふなちゅう", view: "鮒忠" },
			{ typing: "いえてい", view: "家帝" },
			{ typing: "ちくりん", view: "竹林" },
			{ typing: "てんてんぼう", view: "天天房" }
		]
	},
	{	// 最終ラウンド：早打ち王決定戦
		limitSec: 120,
		aggregateCount: 15,
		roundName: '早打ち王決定戦',
		words: [
			{ typing: "あじのもと", view: "味の素" },
			{ typing: "くのーるかっぷすーぷ", view: "クノールカップスープ" },
			{ typing: "やさしお", view: "やさしお" },
			{ typing: "ほんだし", view: "ほんだし" },
			{ typing: "なべきゅーぶ", view: "鍋キューブ" },
			{ typing: "はいみー", view: "ハイミー" },
			{ typing: "ぴゅあせれくとまよねーず", view: "ピュアセレクトマヨネーズ" },
			{ typing: "あみのばいたる", view: "アミノバイタル" },
			{ typing: "あくあそりた", view: "アクアソリタ" },
			{ typing: "おにくやわらかのもと", view: "お肉やわらかの素" },
			{ typing: "すーぷでり", view: "スープDELI" },
			{ typing: "ぱるすいーと", view: "パルスイート" },
			{ typing: "まるどりがらすーぷ", view: "丸鶏がらスープ" },
			{ typing: "こうみぺーすと", view: "香味ペースト" },
			{ typing: "あじしお", view: "アジシオ" },
			{ typing: "おかずごはん", view: "おかずごはん" },
			{ typing: "きょうのおおざら", view: "きょうの大皿" },
			{ typing: "さらりあ", view: "サラリア" },
			{ typing: "めでぃみる", view: "メディミル" },
			{ typing: "あみのえーる", view: "アミノエール" },
			{ typing: "ちゅうかあじ", view: "中華あじ" },
			{ typing: "せとのほんじお", view: "瀬戸のほんじお" },
			{ typing: "びおりご", view: "ビオリゴ" },
			{ typing: "たんぱくしつがしっかりとれるすーぷ", view: "たんぱく質がしっかり摂れるスープ" },
			{ typing: "こんそめちきん", view: "コンソメチキン" },
			{ typing: "すーぱーおおむぎがゆとりとほたてのだしじたて", view: "スーパー大麦がゆ鶏とホタテのだし仕立て" },
			{ typing: "くのーるかっぷすーぷぷれみあむ", view: "クノールカップスーププレミアム" },
			{ typing: "あみのぷろていんちょこれーとあじ", view: "アミノプロテインチョコレート味" },
			{ typing: "それいけ！あんぱんまんすーぷ", view: "それいけ！アンパンマンスープ" },
			{ typing: "つめたいぎゅうにゅうでつくるじゃがいものぽたーじゅ", view: "冷たい牛乳でつくるじゃがいものポタージュ" },
			{ typing: "のみかた", view: "ノ・ミカタ" },
			{ typing: "ふんわりかにたまのもと", view: "ふんわりかに玉の素" },
			{ typing: "ほしかいばしらすーぷ", view: "干し貝柱スープ" },
			{ typing: "おしおひかえめのほんだし", view: "お塩控えめの・ほんだし" },
			{ typing: "かんこくちげすーぷ", view: "韓国チゲスープ" },
			{ typing: "おいすたーそーす", view: "オイスターソース" }
		]
	}
];


/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: true,
	state 	: {
		screenInfo: {
			roundCtlChannel: location.search.substring(1),
			wordsString : ''
		},
		roundInfo	: {
			limitSec		: 60,
			roundId			: '',
			aggregateCount	: 15,
			roundName		: '',
			words			: []
		},
		runningRound: {
			roundId			: ''
		}
	},

	debugConsole()
	{
		if(this.debug){
			console.dir(this.state);
		}
	},
	roundStart( words )
	{
		this.state.roundInfo.words = words;
	},

	/**
	 * ラウンド操作用のチャンネル情報を返す
	 */
	getRoundCtlChannel() {
		return this.state.screenInfo.roundCtlChannel;
	},
	/**
	 * ラウンド情報のgetter
	 */
	getRunnningRound() {
		return this.state.runningRound;
	},
	/**
	 * ラウンド情報の設定
	 * @param {*Object} roundInfo
	 */
	setRoundInfo(roundInfo) {
		this.state.roundInfo = Object.assign(this.state.roundInfo, roundInfo);
		this.state.screenInfo.wordsString = JSON.stringify(roundInfo.words);
	}
};


/**
 * PUBNUBインスタンスの初期化とsubscribe設定
 */
	// PUBNUBの初期化処理
	pubnub = PUBNUB.init({
		publish_key:    PUBLISH_KEY,
		subscribe_key:  SUBSCRIBE_KEY
	});

	// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
	pubnub.subscribe({
		channel: ROUND_PROGRESS,
		message: function( message ){
			json = JSON.parse( message );
			console.log( json.type );
			console.dir( json.payload );
			switch( json.type )
			{
				case ROUND_INFO:			// ラウンド情報
					store.state.runningRound = json.payload;
					break;
				case ROUND_START_COUNT:		// ラウンド開始までのカウントダウン
					break;
				case ROUND_FINISH_COUNT:	// ラウンド終了までのカウントダウン
					break;
				case ROUND_START:			// ラウンド開始
					break;
				case ROUND_FINISH:			// ラウンド終了
					break;
				default :
					break;
			}
		}
	});


/**
* メインのVueコンポーネント
*/
const app = new Vue({
	el 		: "#app",
	data	: store.state,
	methods : {
		roundStart :
			function() {
				store.roundStart( JSON.parse( store.state.screenInfo.wordsString ) );
				const sendData = {
					type	: ROUND_START,
					payload	: store.state.roundInfo
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: 'ラウンド開始メッセージを送信しました。',
					type	: 'success'
				});
			},
		roundFinish :
			function () {
				const roundInfo = store.getRunnningRound();
				const sendData = {
					type	: ROUND_FINISH,
					payload: {
						roundId : roundInfo.roundId
					}
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: 'ラウンド終了メッセージを送信しました。',
					type	: 'success'
				});
			},
		openRanking:
			function () {
				const sendData = {
					type	: RANKING_OPEN,
					payload: {}
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: '個人戦候補者表示メッセージを送信しました。',
					type	: 'success'
				});
			},
		closeRanking:
			function () {
				const sendData = {
					type	: RANKING_CLOSE,
					payload: {}
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: '個人戦候補者非表示メッセージを送信しました。',
					type	: 'success'
				});
			},
		loadRound:
			function (num) {
				store.setRoundInfo(ROUND_DATA[num]);
			}
	}
});