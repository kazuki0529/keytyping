/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug: true,
	state: {
		screenInfo: {
			questionCtlChannel: location.search.substring(1),
			questionString: "",
			questionInfo: {
				limitSec: 10,
				questionId: '',
				question: {}
			}
		},
		questionInfo: false
	},
	debugConsole()
	{
		if(this.debug){
			console.dir(this.state);
		}
	},
	questionStart( question )
	{
		this.state.screenInfo.questionInfo = Object.assign({}, this.state.screenInfo.questionInfo, question);
	},

	/**
	 * ラウンド操作用のチャンネル情報を返す
	 */
	getQuestionCtlChannel() {
		return this.state.screenInfo.questionCtlChannel;
	},
	/**
	 * クイズ情報のgetter
	 */
	getQuestionInfo() {
		return this.state.questionInfo;
	},
	/**
	 * ラウンド情報の読み込み
	 * @param {int} index
	 */
	loadQuestionInfo(index) {
		if (index < QUIZ_DATA.length) {
			this.state.screenInfo.questionInfo = QUIZ_DATA[index];
			this.state.screenInfo.questionString = JSON.stringify(QUIZ_DATA[index].question);
		}
	}
};

// PUBNUBの初期化処理
pubnub = PUBNUB.init({
  publish_key:    PUBLISH_KEY,
  subscribe_key:  SUBSCRIBE_KEY
});

// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
pubnub.subscribe({
  channel: QUIZ_PROGRESS,
  message: function( message ){
    json = JSON.parse( message );
    console.log( json.type );
    console.dir( json.payload );
    switch( json.type )
    {
      case QUESTION_INFO:			// 問題情報
        store.state.questionInfo = json.payload;
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
		questionStart :
			function() {
				store.questionStart( JSON.parse( store.state.screenInfo.questionString ) );
				const sendData = {
					type	: QUESTION_START,
					payload	: store.state.screenInfo.questionInfo
				};
				pubnub.publish({
					channel: store.getQuestionCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: '問題開始メッセージを送信しました。',
					type	: 'success'
				});
			},
		questionFinish :
			function () {
				const questionInfo = store.getQuestionInfo();
				const sendData = {
					type	: QUESTION_FINISH,
					payload: {
						questionId: questionInfo.questionId
					}
				};
				pubnub.publish({
					channel: store.getQuestionCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: '問題終了メッセージを送信しました。',
					type	: 'success'
				});
			},
    questionResult :
      function() {
				const questionInfo = store.getQuestionInfo();
        const sendData = {
          type: RESULT,
					payload: {
						questionId: questionInfo.questionId
					}
        };
        pubnub.publish({
          channel: store.getQuestionCtlChannel(),
          message: JSON.stringify( sendData )
        });

        this.$notify({
          title : 'Success',
          message : '結果発表要求メッセージを送信しました。',
          type : 'success'
        });
			},
		openRanking :
			function (mode) {
				const sendData = {
					type: RANKING_OPEN,
					payload: {
						mode: mode
					}
				};
        pubnub.publish({
          channel: store.getQuestionCtlChannel(),
          message: JSON.stringify( sendData )
        });

				const message = (mode === RANKING_MODE.TOTAL ? '総合' : 'チーム別') + 'ランキング表示要求メッセージを送信しました。';
        this.$notify({
          title : 'Success',
          message : message,
          type : 'success'
        });
			},
		closeRanking :
			function () {
				const sendData = {
					type: RANKING_CLOSE,
					payload: {}
				};
        pubnub.publish({
          channel: store.getQuestionCtlChannel(),
          message: JSON.stringify( sendData )
        });

        this.$notify({
          title : 'Success',
          message : 'ランキングクローズ要求メッセージを送信しました。',
          type : 'success'
        });
			},
		loadQuestion:
			function (index) {
				store.loadQuestionInfo(index);
			}
	}
});
