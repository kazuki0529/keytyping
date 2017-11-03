/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: true,
	state 	: {
		screenInfo: {
			questionCtlChannel: location.search.substring(1),
			questionString : JSON.stringify({
        question:"ススムくんとサキちゃんは双子である",
        selections:[
          {
            symbol:"○",
            label:"双子だ",
            isCorrect:false
          },
          {
            symbol:"×",
            label:"双子ではない",
            isCorrect:true
          },
        ],
        comment:"多分双子ではない"
      })
		},
		questionInfo	: {
			limitSec	: 60,
			questionId		: '',
			question:{}
		}
	},

	debugConsole()
	{
		if(this.debug){
			console.dir(this.state);
		}
	},
	questionStart( question )
	{
		this.state.questionInfo.questionData = question;
	},

	/**
	 * ラウンド操作用のチャンネル情報を返す
	 */
	getQuestionCtlChannel() {
		return this.state.screenInfo.questionCtlChannel;
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
					payload	: store.state.questionInfo
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
			function() {
				const sendData = {
					type	: QUESTION_FINISH,
					payload	: {}
				};
				pubnub.publish({
					channel: store.getQuestionCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: 'ラウンド終了メッセージを送信しました。',
					type	: 'success'
				});
			},
    questionResult :
      function() {
        const sendData = {
          type: RESULT,
          payload:{}
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
      }
	}
});
