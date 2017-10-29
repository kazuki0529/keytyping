/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: true,
	state 	: {
		screenInfo: {
			roundCtlChannel: location.search.substring(1),
			wordsString : JSON.stringify([
				{ view:'塚本晃司',      typing:'つかもとこうじ'        },
				{ view:'牧島研之介',    typing:'まきしまけんのすけ'    },
				{ view:'越田健太郎',    typing:'こしだけんたろう'      },
				{ view:'座間哲也',      typing:'ざまてつや'            },
				{ view:'池添雄起',      typing:'いけぞえゆうき'        },
				{ view:'齋藤一樹',      typing:'さいとうかずき'        },
				{ view:'須田菜月',      typing:'すだなつき'            }
			])
		},
		roundInfo	: {
			limitSec	: 60,
			roundId		: '',
			roundName	: '',
			words		: []
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
	}
};


/**
 * PUBNUBインスタンスの初期化とsubscribe設定
 * publish用にPUBNUBインスタンスをグローバル化（ほかにいい方法ない？）
 */
var pubnub = undefined;
$(document).ready(function(){
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
					store.state.roundInfo = json.payload;
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
			function() {
				const sendData = {
					type	: ROUND_FINISH,
					payload	: {}
				};
				pubnub.publish({
					channel: ROUND_CONTROL,
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: 'ラウンド終了メッセージを送信しました。',
					type	: 'success'
				});
			}
	}
});