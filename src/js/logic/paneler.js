/**
 * この画面固有の定数
 */

 /**
* 状態管理オブジェクトの定義
* 画面はこの値を参照して描写を変える
*/
const txtBoxUserName		= $('#txtbox-user-name');

const lblQuestion 			= $('#lbl-question');
const lblUserName 			= $('#lbl-user-name');
const lblAlert 				= $('#lbl-alert');

const pnlSelectTeam			= $('#pnl-select-team');
const pnlPaneler 			= $('#pnl-paneler');
const pnlSelection	 		= $('#pnl-selection');

const divBtnTeam 			= $('#btn-team');

const store = {
	debug: false,
	state: {
		screenInfo: {
			teamList	: TEAM_LOGO,
			alert: {
				type: 'alert alert-info',
				text: 'クイズ開始までしばらくお待ちください'
			},
			quizStatus: QUIZ_STATUS.READY
		},
		userInfo: {
			team	: TEAM.INVALID,	// 選択したチーム
			userId	: false,		// ユーザID（システムが発番）
			userName: '',			// ユーザ名
		},
		quizInfo : false,		// クイズマスターから受け取ったクイズ情報
		answer: {
			questionId	: false,	// ラウンドID
			selectIndex	: -1,		// 現在入力中である単語の配列番号
			selectTime	: false		// 入力終了日時
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
	 * チームボタン押下
	 * @param {TEAM} team		選択したチーム
	 */
	selectTeam: function (team) {
		this.state.userInfo.team 			= team;
		this.state.userInfo.userId 			= generateUUID();
		this.state.screenInfo.quizStatus 	= QUIZ_STATUS.READY;

		this.drawingView(this.state);
	},
	/**
	 * クイズ情報通知
	 * @param {Object} quizInfo
	 */
	notifyQusetionInfo: function (quizInfo) {
		this.state.quizInfo 				= quizInfo;
		this.state.screenInfo.quizStatus 	= QUIZ_STATUS.READY;
		this.state.answer.selectIndex 		= -1;

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
	 * 回答開始
	 *
	 * @param {string} questionId
	 */
	quizStart: function (questionId) {
		this.state.answer.questionId 		= questionId;
		this.state.screenInfo.quizStatus 	= QUIZ_STATUS.RUNNING;

		this.drawingView(this.state);
	},
	/**
	 * クイズ終了
	 */
	quizFinish: function () {
		this.state.screenInfo.quizStatus 	= QUIZ_STATUS.FINISH;
		this.state.quizInfo.remainsSec 		= false;
		
		this.drawingView(this.state);
	},
	/**
	 * 渡されたクイズが有効かチェックする
	 * @param {string} questionId
	 */
	validQuiz: function (questionId) {
		this.drawingView(this.state);

		return ((this.state.quizInfo) && (this.state.quizInfo.questionId === questionId));
	},
	/**
	 * ラウンドの残り時間を記録する
	 * @param {int} remainsSec
	 */
	setQuizRemainsSec: function (remainsSec) {
		this.state.quizInfo.remainsSec = remainsSec;

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
	 * 回答を選択
	 * @param {int} index
	 */
	selectAnswer: function (index) {
		if (this.state.screenInfo.quizStatus === QUIZ_STATUS.RUNNING)
		{	
			this.state.answer.selectIndex 	= index;
			this.state.answer.selectTime 	= new Date();
		}

		this.drawingView(this.state);
	},
	/**
	 * 回答情報のgetter
	 */
	getAnswer: function () {
		return this.state.answer;
	},
	/**
	 * ユーザ情報のgetter
	 */
	getUserInfo: function () {
		return this.state.userInfo;
	},
	/**
	 * 現在のクイズ情報を返す
	 */
	getNowQuestion: function () {
		return this.state.quizInfo;
	},
	/**
	 * 描画処理
	 */
	drawingView: function () {
		// チーム選択してからタイピング画面を表示
		if (this.state.userInfo.team === TEAM.INVALID) {
			pnlSelectTeam.removeClass('hidden');
			pnlPaneler.addClass('hidden');
			lblUserName.addClass('hidden');
		}
		else {
			pnlSelectTeam.addClass('hidden');
			pnlPaneler.removeClass('hidden');
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
		 * 回答画面の描画
		 */
		// ユーザ名と選択したチームのロゴを表示する
		lblUserName.text(this.state.userInfo.userName + 'さん');

		// 回答の選択肢表示
		const quiz = this.getNowQuestion();
		const answer = this.state.answer;
		if (quiz)
		{
			lblQuestion.text('Ｑ．' + quiz.question);
			if (pnlSelection.children().length === 0)
			{
				this.state.quizInfo.selections.map(function (value, index) {
					pnlSelection.append(
						$('<a/>').attr({
							id 		: 'select-answer-'+ index,
							class	: 'list-group-item',
							onclick	: 'selectAnswer( ' + index + ' )'
						}).text(value.symbol + ':' + value.label)
					);
				});
			}

			pnlSelection.children().each(function (index, element) {
				if (element.id === 'select-answer-' + answer.selectIndex) {
					element.className = 'list-group-item active';
				}
				else {
					element.className = 'list-group-item';
				}
			});
		}
		if (this.state.screenInfo.quizStatus === QUIZ_STATUS.RUNNING)
		{
			pnlSelection.children().removeClass('disabled');
		}
		else {
			pnlSelection.children().addClass('disabled');
		}

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
	channel: QUIZ_PROGRESS,
	message: function( message ){
		json = JSON.parse( message );
		console.log(json.type);
		console.dir(json.payload);
		switch( json.type )
		{
			case QUESTION_INFO:			// クイズ情報
				store.notifyQusetionInfo( json.payload );
				break;
			case QUESTION_START_COUNT:	// クイズ開始までのカウントダウン
				/*	
				if( store.validQuiz( json.payload.questionId ) )
				{
					store.setAlert( 'alert alert-warning', 'ラウンド開始' + json.payload.remainsSec + '秒前' )
				}
				*/
				break;
			case QUESTION_FINISH_COUNT:	// クイズ終了までのカウントダウン
				if (store.validQuiz(json.payload.questionId)) {
					store.setQuizRemainsSec(json.payload.remainsSec);
					if (json.payload.remainsSec > 10) {
						store.setAlert('alert alert-info', '残り' + json.payload.remainsSec + '秒')
					} else {
						store.setAlert('alert alert-warning', '残り' + json.payload.remainsSec + '秒')
					}
				}
				break;
			case QUESTION_START:		// クイズ開始
				if( store.validQuiz( json.payload.questionId ) )
				{
					store.setAlert( 'alert alert-info', 'クイズスタート！！' )
					store.quizStart( json.payload.questionId );
				}
				break;
			case QUESTION_FINISH:		// クイズ終了
				if( store.validQuiz( json.payload.questionId ) )
				{
					store.setAlert( 'alert alert-success', 'クイズ終了。次のクイズまでお待ちください。' )
					store.quizFinish(json.payload.questionId);
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
	// 回答選択イベント
	function selectAnswer(index) {
		store.selectAnswer(index);

		// 回答情報をpublish
		const sendData = {
			type: ANSWER,
			payload: {
				userInfo: store.getUserInfo(),
				answer: store.getAnswer()
			}
		};
		pubnub.publish({
			channel: QUIZ_ANSWER,
			message: JSON.stringify(sendData)
		});
	}

	// 描画処理
	store.drawingView(store.state);
