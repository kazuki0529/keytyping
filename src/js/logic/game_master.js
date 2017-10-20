/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: false,
	state 	: {
		gameInfo	: {
			limitSec	: -1,
			roundId		: '',
			roundName	: '',
			words		: []
		},
		summary			: []
	},

	initGameInfo()
	{
		this.state.gameInfo.limitSec			= -1;
		this.state.gameInfo.roundId				= '';
		this.state.gameInfo.limroundNameitSec 	= '';
		this.state.gameInfo.words 				= [];
	}
};


/**
 * PUBNUBインスタンスの初期化とsubscribe設定
 */
	// PUBNUBの初期化処理
	var pubnub = PUBNUB.init({
		publish_key:    PUBLISH_KEY,
		subscribe_key:  SUBSCRIBE_KEY
	});

// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
// Game Master操作用画面からpublishを受け取る
pubnub.subscribe({
	channel: GAME_CONTROL,
	message: function( message ){
		json = JSON.parse( message );
		console.dir(json);
		switch( json.type )
		{
			case GAME_START:		// ゲーム開始
				/**
				 * ①ゲームの情報をpublish
				 * ②開始までのカウントダウンをpublish
				 * ③ゲーム開始をpublish
				 * ④試合時間を過ぎたらゲーム終了をpublish
				 */
				store.state.gameInfo 			= json.payload;
				store.state.gameInfo.roundId	= generateUUID();
				// 集計準備
				store.state.summary[store.state.gameInfo.roundId] = [];
				const sendInfo = {
					type	: GAME_INFO,
					payload	: store.state.gameInfo
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendInfo )
				});

				// TODO:カウントダウン処理めんどいので後で実装。。。
				const sendStart = {
					type	: GAME_START,
					payload	: {
						roundId	: store.state.gameInfo.roundId
					}
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendStart )
				});
				break;
			case GAME_FINISH:		// ゲーム終了
				// ゲーム終了
				const sendData = {
					type	: GAME_FINISH,
					payload	: {
						roundId	: store.state.gameInfo.roundId
					}
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendData )
				});

				store.initGameInfo();
				break;
			default :
				break;
		}
	}
});

// プレイヤー画面からのメッセージを受け取る
pubnub.subscribe({
	channel: ANSWER,
	message: function( message ){
		json = JSON.parse( message );
		console.dir(json);
		switch( json.type )
		{
			case INPUT_FINISH:		// 単語入力完了
				// 単語情報のため込み
				// TODO:カッコイイ方法ないか。。。
				//store.state.summary[store.state.gameInfo.roundId][json.payload.userInfo.team][json.payload.userInfo.userId] =  json.payload;
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

	}
});
