/**
 * この画面固有の定数
 */
	const DISP_TIME_COUNT_DOWN		= 1200		// ラウンド開始／終了カウントダウンの通知の表示時間
	const DISP_TIME_START_FINISH	= 3000		// ラウンド開始／終了の通知の表示時間

/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
	const txtBoxUserName		= $('#txtbox-user-name');
	const txtBoxTyping 			= $('#txtbox-typing');
	const lblWordView			= $('#lbl-word-view');
	const lblWordTypingMatch	= $('#lbl-word-typing-match');
	const lblWordTyping			= $('#lbl-word-typing');
	const lblUserName 			= $('#lbl-user-name');
	const lblAlert 				= $('#lbl-alert');

	const pnlSelectTeam			= $('#pnl-select-team');
	const pnlTyping 			= $('#pnl-typing');

	const divBtnTeam 			= $('#btn-team');

	const prgTyping 			= $('#prg-typing');

	const store = {
		debug: false,
		state: {
			screenInfo: {
				matchString	: '',			// 入力が一致してる文字
				teamList	: TEAM_LOGO,
				alert: {
					type: 'alert alert-info',
					text: 'ラウンド開始までしばらくお待ちください'
				},
				roundStatus: ROUND_STATUS.READY
			},
			userInfo: {
				team: TEAM.INVALID,	// 選択したチーム
				userId: false,		// ユーザID（システムが発番）
				userName: '',			// ユーザ名
			},
			roundInfo: false,			// ゲームマスターから受け取ったラウンド情報
			input: {
				roundId: false,		// ラウンドID
				wordsIndex: -1,			// 現在入力中である単語の配列番号
				startTime: false,		// 入力開始日時
				finishTime: false			// 入力終了日時
			},
		},

		/**
		 * ユーザ名入力
		 * @param {string} userName 	入力したユーザ名
		 */
		inputUserName: function (userName) {
			this.state.userInfo.userName = userName;

			this.drawingView(this.state);
		},
		/**
		 * 一致した文字列の設定
		 * @param {string} matchString 	一致した文字列
		 */
		setMatchString: function (matchString) {
			this.state.screenInfo.matchString = matchString

			this.drawingView(this.state);
		},	
		/**
		 * チームボタン押下
		 * @param {TEAM} team		選択したチーム
		 */
		selectTeam: function (team) {
			this.state.userInfo.team = team;
			this.state.userInfo.userId = generateUUID();
			this.state.screenInfo.roundStatus = ROUND_STATUS.READY;

			this.drawingView(this.state);
		},
		/**
		 * ラウンド情報通知
		 * @param {Object} roundInfo
		 */
		notifyRoundInfo: function (roundInfo) {
			this.state.roundInfo = roundInfo;
			this.state.screenInfo.roundStatus = ROUND_STATUS.READY;

			this.drawingView(this.state);
		},
		/**
		 * 通知エリアに表示する情報の設定
		 * @param {string} type 
		 * @param {string} text 
		 */
		setAlert: function (type, text) {
			this.state.screenInfo.alert.type = type;
			this.state.screenInfo.alert.text = text;

			this.drawingView(this.state);
		},
		/**
		 * ラウンド開始
		 *
		 * @param {string} roundId
		 */
		roundStart: function (roundId) {
			this.state.input.roundId = roundId;
			this.state.input.wordsIndex = 0;
			this.state.input.startTime = new Date();
			this.state.screenInfo.roundStatus = ROUND_STATUS.RUNNING;
			this.state.screenInfo.typing = '';

			this.drawingView(this.state);
		},
		/**
		 * ラウンド終了
		 */
		roundFinish: function () {
			// こうしないと再描画されない
			// IEだとObject.assignが使えないので。。。
			this.state.screenInfo.roundStatus = ROUND_STATUS.FINISH;
			var roundInfo = this.state.roundInfo;
			roundInfo.remainsSec = false;
			this.state.roundInfo = roundInfo;

			this.drawingView(this.state);
		},
		/**
		 * 渡されたラウンドが有効かチェックする
		 * @param {string} roundId
		 */
		validRound: function (roundId) {
			this.drawingView(this.state);

			return ((this.state.roundInfo) && (this.state.roundInfo.roundId === roundId));
		},
		/**
		 * 入力した文字がタイプすべき文字と一致しているかを返す
		 * @param {string} inputString
		 */
		isMatchTyping: function (inputString) {
			// 配列の範囲内かチェック
			if (this.state.roundInfo.words.length > this.state.input.wordsIndex) {
				return (inputString === this.state.roundInfo.words[store.state.input.wordsIndex].typing);
			}
			return false;
		},
		/**
		 * ラウンドの残り時間を記録する
		 * @param {int} remainsSec
		 */
		setRoundRemainsSec: function (remainsSec) {
			// こうしないと再描画されない
			// IEだとObject.assignが使えないので。。。
			var roundInfo = this.state.roundInfo;
			roundInfo.remainsSec = remainsSec;
			this.state.roundInfo = roundInfo;

			this.drawingView(this.state);
		},
		/**
		 * 選択したチームの情報を返す
		 */
		getSelectedTeam: function () {
			const team = this.state.screenInfo.teamList.filter(function (team) {
				return team.key === store.state.userInfo.team;
			});

			if (team.length === 1) {
				return team[0];
			}
			else {
				return false;
			}
		},
		/**
		 * 今入力すべき課題の情報を返す
		 */
		getNowWord: function () {
			if ((this.state.input.wordsIndex >= 0)
				&& (this.state.roundInfo.words.length > store.state.input.wordsIndex)) {
				return store.state.roundInfo.words[store.state.input.wordsIndex];
			}
			return false;
		},
		/**
		 * 準備中か判断
		 */
		isRoundReady: function () {
			return (this.state.screenInfo.roundStatus === ROUND_STATUS.READY);
		},
		/**
		 * ラウンドが進行中か判断
		 */
		isRoundRunning: function () {
			return (this.state.screenInfo.roundStatus === ROUND_STATUS.RUNNING);
		},
		/**
		 * 入力の進捗状況を返す
		 */
		calcTypingProgress: function () {
			if ((this.state.input.wordsIndex >= 1)
				&& (this.state.roundInfo.words.length > 0)) {
				return (Math.round((this.state.input.wordsIndex * 100) / this.state.roundInfo.words.length));
			}
			return 0;
		},
		/**
		 * 入力完了
		 */
		inputFinish: function () {
			this.state.input.finishTime = new Date();
		},
		/**
		 * 次の入力課題を設定
		 */
		setNextWord: function () {
			this.state.input.wordsIndex++;
			this.state.input.startTime = new Date();
			this.state.screenInfo.matchString = '';

			this.drawingView(this.state);
		},
		/**
		 * 入力情報のgetter
		 */
		getInput: function () {
			return this.state.input;
		},
		/**
		 * ユーザ情報のgetter
		 */
		getUserInfo: function () {
			return this.state.userInfo;
		},

		/**
		 * 描画処理
		 */
		drawingView: function () {
			// チーム選択してからタイピング画面を表示
			if (this.state.userInfo.team === TEAM.INVALID) {
				pnlSelectTeam.removeClass('hidden');
				pnlTyping.addClass('hidden');
				lblUserName.addClass('hidden');
			}
			else {
				pnlSelectTeam.addClass('hidden');
				pnlTyping.removeClass('hidden');
				lblUserName.removeClass('hidden');
			}
	
			/**
			 * チーム選択画面の描画
			 */
			// 名前を入力したらチーム選択ボタンを表示
			if (this.state.userInfo.userName === '') {
				divBtnTeam.empty();
			}
			else if (divBtnTeam.children().length === 0) {
				this.state.screenInfo.teamList.map(function (value) {
					divBtnTeam.append(
						$('<a/>').attr({
							onclick: 'selectTeam( \'' + value.key + '\' )'
						}).append($('<img/>').attr(
							{ src: value.image })));
				});
			}
	
			/**
			 * タイピング画面の描画
			 */
			// ユーザ名と選択したチームのロゴを表示する
			lblUserName.text(this.state.userInfo.userName + 'さん');
	
			// 単語情報を表示
			const nowWord = store.getNowWord();
			txtBoxTyping.prop('disabled', !(nowWord && this.state.screenInfo.roundStatus === ROUND_STATUS.RUNNING));
			if (nowWord) {
				lblWordView.text(nowWord.view);
				lblWordTypingMatch.text(this.state.screenInfo.matchString);
				lblWordTyping.text(nowWord.typing.substring(this.state.screenInfo.matchString.length));
				txtBoxTyping.attr('placeholder', nowWord.typing);
	
				// iOS用のfocusセット（出来てない。。。）
				// http://alpha.mixi.co.jp/entry/2012/10807/
				txtBoxTyping.focus();
				txtBoxTyping.on('click', function () {
					txtBoxTyping.focus();
				});
			}
	
			// 進捗状況の変更
			prgTyping.width(store.calcTypingProgress() + "%");
			//prgTyping.text(store.calcTypingProgress() + "%");
	
			// 通知領域の制御
			lblAlert.attr({ class: this.state.screenInfo.alert.type });
			lblAlert.text(this.state.screenInfo.alert.text);
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
		channel: ROUND_PROGRESS,
		message: function( message ){
			json = JSON.parse( message );
			console.log(json.type);
			console.dir(json.payload);
			switch( json.type )
			{
				case ROUND_INFO:			// ラウンド情報
					store.notifyRoundInfo( json.payload );
					break;
				case ROUND_START_COUNT:	// ラウンド開始までのカウントダウン
					if( store.validRound( json.payload.roundId ) )
					{
						store.setAlert( 'alert alert-warning', 'ラウンド開始' + json.payload.remainsSec + '秒前' )
					}
					break;
				case ROUND_FINISH_COUNT:	// ラウンド終了までのカウントダウン
					if (store.validRound(json.payload.roundId)) {
						store.setRoundRemainsSec(json.payload.remainsSec);
						if (json.payload.remainsSec > 3) {
							store.setAlert('alert alert-info', '残り' + json.payload.remainsSec + '秒')
						} else {
							store.setAlert('alert alert-warning', '残り' + json.payload.remainsSec + '秒')
						}
					}
					break;
				case ROUND_START:		// ラウンド開始
					if( store.validRound( json.payload.roundId ) )
					{
						store.setAlert( 'alert alert-info', 'ラウンドスタート！！' )
						store.roundStart( json.payload.roundId );
					}
					break;
				case ROUND_FINISH:		// ラウンド終了
					if( store.validRound( json.payload.roundId ) )
					{
						store.setAlert( 'alert alert-success', 'ラウンド終了。次のラウンドまでお待ちください。' )
						store.roundFinish(json.payload.roundId);
					}
					break;
				default :
					break;
			}
		}
	});

	/**
	 * 画面のイベント登録
	 */	
	// ユーザ名入力のkeyupイベント登録
	txtBoxUserName.keyup(function (e) {
		store.inputUserName(e.target.value);
	});
	// チーム選択イベント
	function selectTeam(team) {
		store.selectTeam(team);
	}
	// タイピングのkeypressイベント登録
	txtBoxTyping.keypress(function () {
		const inputString = txtBoxTyping.val();
		if (store.isMatchTyping(inputString)) {
			store.inputFinish();

			// 入力完了情報をpublish
			const sendData = {
				type: INPUT_FINISH,
				payload: {
					userInfo: store.getUserInfo(),
					input: store.getInput()
				}
			};
			pubnub.publish({
				channel: ANSWER,
				message: JSON.stringify(sendData)
			});

			// 次の単語データセット
			store.setNextWord();
			txtBoxTyping.focus();
			txtBoxTyping.val('');
		}
	});
	// タイピング成功している箇所については薄いグレーにする
	txtBoxTyping.keyup(function (e) {
		const inputString = e.target.value;

		// 前方一致した場合
		const nowWord = store.getNowWord();
		if (!nowWord) {
			store.setMatchString('');
		}
		if ((nowWord)
		&&	(nowWord.typing.indexOf(inputString) === 0)) {
			store.setMatchString(inputString);
		}
	});

	// 描画処理
	store.drawingView(store.state);
