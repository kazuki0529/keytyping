/**
* オブジェクト定義
*/

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
	* PubNubへのpublishオブジェクトを返す高階関数
	* @param {Object} pubnub PubNubオブジェクト
	*/
	function Publisher(pubnub){
		return {
			/**
			* GAME_INFOイベントのpublisher
			* @param {Object} info game情報
			*/
			gameInfo:function(info){
				var sendInfo = {
					type	: GAME_INFO,
					payload	: info
				};

				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendInfo )
				});
			},
			/**
			* GAME_STARTイベントのpublisher
			* @param {String} roundId ラウンドのID
			*/
			gameStart:function(roundId){
				const sendStart = {
					type	: GAME_START,
					payload	: {
						roundId	: roundId
					}
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendStart )
				});
			},
			/**
			* GAME_FINISHイベントのpublisher
			* @param {String} roundId ラウンドのID
			*/
			gameFinish:function(roundId){
				const sendData = {
					type	: GAME_FINISH,
					payload	: {
						roundId	: roundId
					}
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendData )
				});
			}
		};
	}

	/**
	* PubNubからのsubscribe時のイベント群を返す高階関数
	* @param {Object} store storeオブジェクト
	* @param {Object} publisher Publisherオブジェクト
	* @param {function} idGenerator UUID作成関数
	*/
	function SubscribeEvents(store,publisher,idGenerator){
		return {
			/**
			* GAME_STARTイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameStart:function(message){
				/**
				 * ①ゲームの情報をpublish
				 * ②開始までのカウントダウンをpublish
				 * ③ゲーム開始をpublish
				 * ④試合時間を過ぎたらゲーム終了をpublish
				 */
				var gameInfo = message.payload;
				var roundId = idGenerator();
				gameInfo.roundId	= roundId;
				store.state.gameInfo 			= gameInfo;
				// 集計準備
				store.state.summary[roundId] = [];

				publisher.gameInfo(gameInfo);

				// TODO:カウントダウン処理めんどいので後で実装。。。
				publisher.gameStart(roundId);
			},
			/**
			* GAME_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameFinish:function(message){
				publisher.gameFinish(store.state.gameInfo.roundId);
				store.initGameInfo();
			},
			/**
			* INPUT_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onInputFinish:function(message){
				// 単語情報のため込み
				// TODO:カッコイイ方法ないか。。。
				//store.state.summary[store.state.gameInfo.roundId][json.payload.userInfo.team][json.payload.userInfo.userId] =  json.payload;
			}
		};
	}



/**
* メイン処理
*/

	//unit test時は実行しない
	if(location.href.indexOf("test") === -1){
		/**
		* メインのVueコンポーネント
		*/
		const app = new Vue({
			el 		: "#app",
			data	: store.state,
			methods : {

			}
		});

		/**
		 * PUBNUBインスタンスの初期化とsubscribe設定
		 */
		// PUBNUBの初期化処理
		var pubnub = PUBNUB.init({
			publish_key:    PUBLISH_KEY,
			subscribe_key:  SUBSCRIBE_KEY
		});

		//PubNubへのpublishオブジェクトのインスタンス
		const publisher = Publisher(pubnub);

		//PUBNUBからのsubscribe時のイベント群
		const subscribeEvents = SubscribeEvents(store,publisher,generateUUID);

		/**
		* PubNub制御
		*/

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
						subscribeEvents.onGameStart(json);
						break;
					case GAME_FINISH:		// ゲーム終了
						subscribeEvents.onGameFinish(json);
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
						subscribeEvents.onInputFinish(json);
						break;
					default :
						break;
				}
			}
		});
	}
