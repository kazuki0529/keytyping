/**
 * この画面固有の定数
 */
	const DISP_TIME_COUNT_DOWN		= 1000		// ゲーム開始／終了カウントダウンの通知の表示時間
	const DISP_TIME_START_FINISH	= 3000		// ゲーム開始／終了の通知の表示時間

	const ROUND_STATUS = {
		READY	: "READY",						//準備中
		RUNNING	: "RUNNING",					//実行中
		FINISH	: "FINISH"						//完了
	}


/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
	const store = {
		debug	: false,
		state	: {
			screenInfo :{
				typing		: '',			// 入力した文字
				teamList :[
					{ image:'./img/spring.png', value : TEAM.SPRING },
					{ image:'./img/summer.png', value : TEAM.SUMMER },
					{ image:'./img/autumn.png', value : TEAM.AUTUMN },
					{ image:'./img/winter.png', value : TEAM.WINTER }
				],
				roundStatus	: ROUND_STATUS.READY
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
			this.state.userInfo.team			= team;
			this.state.userInfo.userId			= generateUUID();
			this.state.screenInfo.gameStatus	= ROUND_STATUS.READY;
		},
		/**
		 * ゲーム情報通知
		 * @param {Object} gameInfo 
		 */
		notifyGameInfo( gameInfo )
		{
			this.state.gameInfo = Object.assign( {}, gameInfo );
		},
		/**
		 * ゲーム開始
		 * 
		 * @param {string} roundId 
		 */
		gameStart( roundId )
		{
			this.state.input.roundId			= roundId;
			this.state.input.wordsIndex			= 0;
			this.state.input.startTime			= new Date();
			this.state.screenInfo.roundStatus	= ROUND_STATUS.RUNNING;
			this.state.screenInfo.typing 		= '';
		},
		/**
		 * ゲーム終了
		 */
		gameFinish()
		{
			this.state.screenInfo.roundStatus = ROUND_STATUS.FINISH;
		},
		/**
		 * 渡されたラウンドが有効かチェックする
		 * @param {string} roundId 
		 */
		validRound( roundId )
		{
			return (this.state.gameInfo.roundId === roundId);
		},
		/**
		 * 入力した文字がタイプすべき文字と一致しているかを返す
		 * @param {string} inputString 
		 */
		isMatchTyping( inputString )
		{
			// 配列の範囲内かチェック
			if( this.state.gameInfo.words.length > this.state.input.wordsIndex )
			{
				return  (inputString === this.state.gameInfo.words[store.state.input.wordsIndex].typing );
			}
			return false;
		},
		/**
		 * 今入力すべき課題の情報を返す
		 */
		getNowWord()
		{
			if(	( this.state.input.wordsIndex >= 0									)
			&&	( this.state.gameInfo.words.length > store.state.input.wordsIndex	) )
			{
				return store.state.gameInfo.words[store.state.input.wordsIndex];
			}
			return false;
		},
		/**
		 * 準備中か判断
		 */
		isRoundReady()
		{
			return( this.state.screenInfo.roundStatus === ROUND_STATUS.READY );
		},
		/**
		 * ラウンドが進行中か判断
		 */
		isRoundRunning()
		{
			return( this.state.screenInfo.roundStatus === ROUND_STATUS.RUNNING );
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
			console.log(json.type);
			console.dir(json.payload);
			switch( json.type )
			{
				case GAME_INFO:			// ゲーム情報
					store.state.gameInfo = json.payload;
					break;
				case GAME_START_COUNT:	// ゲーム開始までのカウントダウン
					if( store.validRound( json.payload.roundId ) )
					{
						app.$message({
							type		: 'warning',
							message		: '開始' + json.payload.remainsSec + '秒前',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_FINISH_COUNT:	// ゲーム終了までのカウントダウン
					if( store.validRound( json.payload.roundId ) )
					{
						app.$message({
							type		: 'warning',
							message		: '終了' + json.payload.remainsSec + '秒前',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_START:		// ゲーム開始
					if( store.validRound( json.payload.roundId ) )
					{
						store.gameStart( json.payload.roundId );
						app.$message({
							message		: 'ゲームスタート',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_FINISH:		// ゲーム終了
					if( store.validRound( json.payload.roundId ) )
					{
						store.gameFinish( json.payload.roundId );
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
					if( store.isMatchTyping( value ) )
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
				const nowWord = store.getNowWord();
				if( nowWord )
				{
					return nowWord.view;
				}

				this.$message({
					type		: 'success',
					message		: 'Congratulation!!',
					duration	: 3000
				});
				return '入力完了！';
			},
			dispTypingWord : function()
			{
				const nowWord = store.getNowWord();
				if( nowWord )
				{
					return nowWord.typing;
				}
				return '';
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
				const team = store.state.screenInfo.teamList.filter( function( team ){
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
			},
			isRoundReady : function()
			{
				return( store.isRoundReady() );
			},
			isRoundRunning : function()
			{
				return( store.isRoundRunning() );
			}
		}
	});