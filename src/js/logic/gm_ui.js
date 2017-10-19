/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: true,
	state 	: {
		screenInfo	: {
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
		gameInfo	: {
			limitSec	: 60,
			roundId		: '',
			roundName	: '',
			words		: []
		}
	},

	debugConsole(){
		if(this.debug){
			console.dir(this.state);
		}
	},
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
					break;
				case GAME_FINISH_COUNT:	// ゲーム終了までのカウントダウン
					break;
				case GAME_START:		// ゲーム開始
					break;
				case GAME_FINISH:		// ゲーム終了
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
		changeLimitSec	:
			function( value ) {
				store.changeLimitSec( value );
			},
		inputRoundName	:
			function( value ) {
				store.inputRoundName( value );
			},
		inputWords	:
			function( value ) {
				store.inputWords( value );
			},
		gameStart :
			function() {
				store.state.gameInfo.words = JSON.parse(store.state.screenInfo.wordsString);
				const sendData = {
					type	: GAME_START,
					payload	: store.state.gameInfo
				};
				pubnub.publish({
					channel: GAME_CONTROL,
					message: JSON.stringify( sendData )
				});
			},
		gameFinish :
			function() {
				const sendData = {
					type	: GAME_FINISH,
					payload	: {}
				};
				pubnub.publish({
					channel: GAME_CONTROL,
					message: JSON.stringify( sendData )
				});
			}
	}
});