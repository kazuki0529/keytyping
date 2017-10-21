/**
 * この画面固有の定数
 */
const DISP_TIME_COUNT_DOWN		= 1000		// ゲーム開始／終了カウントダウンの通知の表示時間
const DISP_TIME_START_FINISH	= 3000		// ゲーム開始／終了の通知の表示時間

/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: false,
	state	: {
		screenInfo :{
			typing		: '',			// 入力した文字
			isPlaying	: false,			// ゲーム開催中
			teamList :[
				{ image:'./img/spring.png', value : TEAM.SPRING },
				{ image:'./img/summer.png', value : TEAM.SUMMER },
				{ image:'./img/autumn.png', value : TEAM.AUTUMN },
				{ image:'./img/winter.png', value : TEAM.WINTER }
			]
		},
		userInfo : {
			team		: TEAM.INVALID,	// 選択したチーム
			userId		: undefined,	// ユーザID（システムが発番）
			userName	: '',			// ユーザ名
		},
		gameInfo	: undefined,		// ゲームマスターから受け取ったゲーム情報
		input		: {
			roundId		: undefined,	// ラウンドID
			wordsIndex	: -1,			// 現在入力中である単語の配列番号
			startTime	: undefined,	// 入力開始日時
			finishTime	: undefined,	// 入力終了日時
		},
	},

	/**
	 * チームボタン押下
	 * @param {TEAM} team		選択したチーム
	 */
	selectTeam( team )
	{
		this.state.userInfo.team		= team;
		this.state.userInfo.userId		= generateUUID();
	}
};


/** 以下メイン処理 */
/**
 * PUBNUBインスタンスの初期化とsubscribe設定
 * publish用にPUBNUBインスタンスをグローバル化（ほかにいい方法ない？）
 */
	// PUBNUBの初期化処理
	var pubnub = PUBNUB.init({
		publish_key:    PUBLISH_KEY,
		subscribe_key:  SUBSCRIBE_KEY
	});

	// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
	pubnub.subscribe({
		channel: GAME_PROGRESS,
		message: function( message ){
			json = JSON.parse( message );
			console.dir(json);
			switch( json.type )
			{
				case GAME_INFO:			// ゲーム情報
					store.state.gameInfo = json.payload;
					break;
				case GAME_START_COUNT:	// ゲーム開始までのカウントダウン
					if( store.state.gameInfo.roundId === json.payload.roundId ) {
						app.$message({
							type		: 'warning',
							message		: '開始' + json.payload.remainsSec + '秒前',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_FINISH_COUNT:	// ゲーム終了までのカウントダウン
					if( store.state.gameInfo.roundId === json.payload.roundId ) {
						app.$message({
							type		: 'warning',
							message		: '終了' + json.payload.remainsSec + '秒前',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_START:		// ゲーム開始
					if( store.state.gameInfo.roundId === json.payload.roundId ) {
						store.state.screenInfo.isPlaying	= true;
						store.state.input.wordsIndex		= 0;
						store.state.input.startTime			= new Date();
						store.state.input.roundId			= store.state.gameInfo.roundId;
						store.state.screenInfo.typing 		= '';
						app.$message({
							message		: 'ゲームスタート',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_FINISH:		// ゲーム終了
					if(store.state.gameInfo.roundId === json.payload.roundId) {
						store.state.screenInfo.isPlaying	= false;
						app.$message({
							message		: 'ゲーム終了',
							duration	: DISP_TIME_START_FINISH
						});
					}
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
			selectTeam :		// チーム選択
				function( team ){
					store.selectTeam( team );
				},
			typing :			// タイピング中
				function( value )
				{
					// タイピング課題と入力した文字が一致したらpublishする
					// その後、次の単語データがあれば画面に単語データをセット
					if( ( store.state.gameInfo.words.length > store.state.input.wordsIndex 			)
					&&	( value === store.state.gameInfo.words[store.state.input.wordsIndex].typing ) )
					{
						store.state.input.finishTime = new Date();
						const sendData = {
							type	: INPUT_FINISH,
							payload	: {
								userInfo	: store.state.userInfo,
								input		: store.state.input
							}
						};
						pubnub.publish({
							channel: ANSWER,
							message: JSON.stringify( sendData )
						});

						store.state.input.wordsIndex++;
						store.state.screenInfo.typing = '';
					}
				}
		},
		computed	:{
			dispViewWord : function()
			{
				if(	( store.state.input.wordsIndex >= 0									)
				&&	( store.state.gameInfo.words.length > store.state.input.wordsIndex	) )
				{
					return store.state.gameInfo.words[store.state.input.wordsIndex].view;
				}
				else
				{
					this.$message({
						type		: 'success',
						message		: 'Congratulation!!',
						duration	: 3000
					});
					return '入力完了！';
				}
			},
			dispTypingWord : function()
			{
				if(	( store.state.input.wordsIndex >= 0									)
				&&	( store.state.gameInfo.words.length > store.state.input.wordsIndex	) )
				{
					return store.state.gameInfo.words[store.state.input.wordsIndex].typing;
				}
				else
				{
					return '';
				}
			},
			calcTypingProgress : function()
			{
				if(	store.state.input.wordsIndex >= 1 )
				{
					return ( (store.state.input.wordsIndex * 100 ) / store.state.gameInfo.words.length );
				}
				return 0;
			},
			getTeamImage : function()
			{
				const team = store.state.screenInfo.teamList.filter(function( team ){
					return team.value === store.state.userInfo.team;
				});

				if( team.length === 1 )
				{
					return team[0].image;
				}
				else
				{
					return undefined;
				}
			}
		}
	});