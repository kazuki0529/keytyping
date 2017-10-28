/**
 * この画面固有の定数
 */
	const DISP_TIME_COUNT_DOWN		= 1200		// ゲーム開始／終了カウントダウンの通知の表示時間
	const DISP_TIME_START_FINISH	= 3000		// ゲーム開始／終了の通知の表示時間

	/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
	const store = {
		debug	: false,
		state	: {
			screenInfo : {
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
				userId		: false,		// ユーザID（システムが発番）
				userName	: '',			// ユーザ名
			},
			roundInfo	: false,			// ゲームマスターから受け取ったゲーム情報
			input		: {
				roundId		: false,		// ラウンドID
				wordsIndex	: -1,			// 現在入力中である単語の配列番号
				startTime	: false,		// 入力開始日時
				finishTime	: false			// 入力終了日時
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
			this.state.screenInfo.roundStatus	= ROUND_STATUS.READY;
		},
		/**
		 * ゲーム情報通知
		 * @param {Object} roundInfo
		 */
		notifyRoundInfo( roundInfo )
		{
			this.state.roundInfo = roundInfo;
		},
		/**
		 * ゲーム開始
		 *
		 * @param {string} roundId
		 */
		roundStart( roundId )
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
		roundFinish()
		{
			this.state.screenInfo.roundStatus = ROUND_STATUS.FINISH;
			this.state.roundInfo = Object.assign({}, this.state.roundInfo, { remainsSec: false } );
		},
		/**
		 * 渡されたラウンドが有効かチェックする
		 * @param {string} roundId
		 */
		validRound( roundId )
		{
			return ( ( this.state.roundInfo ) && ( this.state.roundInfo.roundId === roundId ) );
		},
		/**
		 * 入力した文字がタイプすべき文字と一致しているかを返す
		 * @param {string} inputString
		 */
		isMatchTyping( inputString )
		{
			// 配列の範囲内かチェック
			if( this.state.roundInfo.words.length > this.state.input.wordsIndex )
			{
				return  (inputString === this.state.roundInfo.words[store.state.input.wordsIndex].typing );
			}
			return false;
		},
		/**
		 * ラウンドの残り時間を記録する
		 * @param {int} remainsSec
		 */
		setRoundRemainsSec( remainsSec )
		{
			// こうしないと再描画されない
			this.state.roundInfo = Object.assign(
										{},
										this.state.roundInfo,
										{ remainsSec: remainsSec } );
		},
		/**
		 * 選択したチームの情報を返す
		 */
		getSelectedTeam()
		{
			const team = this.state.screenInfo.teamList.filter( function( team ){
				return team.value === store.state.userInfo.team;
			});

			if( team.length === 1 )
			{
				return team[0];
			}
			else
			{
				return false;
			}
		},
		/**
		 * 今入力すべき課題の情報を返す
		 */
		getNowWord()
		{
			if(	( this.state.input.wordsIndex >= 0									)
			&&	( this.state.roundInfo.words.length > store.state.input.wordsIndex	) )
			{
				return store.state.roundInfo.words[store.state.input.wordsIndex];
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
		},
		/**
		 * 入力の進捗状況を返す
		 */
		calcTypingProgress()
		{
			if(	( this.state.input.wordsIndex >= 1		)
			&&	( this.state.roundInfo.words.length > 0 ) )
			{
				return ( (this.state.input.wordsIndex * 100 ) / this.state.roundInfo.words.length );
			}
			return 0;
		},
		/**
		 * 入力完了
		 */
		inputFinish()
		{
			this.state.input.finishTime = new Date();
		},
		/**
		 * 次の入力課題を設定
		 */
		setNextWord()
		{
			this.state.input.wordsIndex++;
			this.state.input.startTime = new Date();
			this.state.screenInfo.typing = '';
		},
		/**
		 * 入力情報のgetter
		 */
		getInput()
		{
			return this.state.input;
		},
		/**
		 * ユーザ情報のgetter
		 */
		getUserInfo()
		{
			return this.state.userInfo;
		}
	};


/** 以下メイン処理 */
/**
 * PUBNUBインスタンスの初期化とsubscribe設定
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
					store.notifyRoundInfo( json.payload );
					break;
				case GAME_START_COUNT:	// ゲーム開始までのカウントダウン
					if( store.validRound( json.payload.roundId ) )
					{
						app.$message({
							message		: '開始' + json.payload.remainsSec + '秒前',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_FINISH_COUNT:	// ゲーム終了までのカウントダウン
					if( store.validRound( json.payload.roundId  ) )
					{
						store.setRoundRemainsSec( json.payload.remainsSec );
						if( json.payload.remainsSec <= 3 )
						{
							app.$message({
								type		: 'warning',
								message		: '終了' + json.payload.remainsSec + '秒前',
								duration	: DISP_TIME_COUNT_DOWN
							});
						}
					}
					break;
				case GAME_START:		// ゲーム開始
					if( store.validRound( json.payload.roundId ) )
					{
						store.roundStart( json.payload.roundId );
						app.$message({
							message		: 'ゲームスタート',
							duration	: DISP_TIME_COUNT_DOWN
						});
					}
					break;
				case GAME_FINISH:		// ゲーム終了
					if( store.validRound( json.payload.roundId ) )
					{
						store.roundFinish( json.payload.roundId );
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
						store.inputFinish();

						const sendData = {
							type	: INPUT_FINISH,
							payload	: {
								userInfo	: store.getUserInfo(),
								input		: store.getInput()
							}
						};
						pubnub.publish({
							channel: ANSWER,
							message: JSON.stringify( sendData )
						});

						// 次の単語がない（すべて入力し終えた場合）は褒めてあげる
						store.setNextWord();
						if(!store.getNowWord())
						{
							this.$message({
								type		: 'success',
								message		: 'Congratulation!!',
								duration	: 3000
							});
						}
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
				return store.calcTypingProgress();
			},
			getTeamImage : function()
			{
				const team = store.getSelectedTeam();
				if( team )
				{
					return team.image;
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