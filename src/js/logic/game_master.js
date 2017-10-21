/**
* 定数定義
*/
	//1ラウンドあたりの時間
	const ROUND_TIME_SEC = 180;

	//ラウンドの状態
	const ROUND_STATUS = {
		READY:"READY", //準備中
		RUNNING:"RUNNING",//実行中
		FINISH:"FINISH"//完了
	}

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
			rounds:{}
		},
		/**
		* roundを追加する
		* @param {Object} roundinfo コントローラから渡されたラウンド情報
		*/
		addRound(roundinfo){
			this.state.rounds[roundinfo.roundId] = Object.assign({},roundinfo,{
				status:ROUND_STATUS.READY,
				remainsSec:ROUND_TIME_SEC,
				players:{
					SPRING:{},
					SUMMER:{},
					AUTUMN:{},
					WINTER:{}
				},
				score:{
					SPRING:0,
					SUMMER:0,
					AUTUMN:0,
					WINTER:0
				}
			});
		},

		/**
		* 指定されたラウンドを実行中にする
		* @param {String} roundId 実行中にするラウンドID
		*/
		setRoundRunning(roundId){
			var round = this.state.rounds[roundId];
			if(round){
				if(round.status === ROUND_STATUS.READY){
					round.status = ROUND_STATUS.RUNNING;
				}
			}
		},

		/**
		* 指定されたラウンドを完了する
		* @param {String} roundId 完了するラウンドID
		*/
		setRoundFinish(roundId){
			var round = this.state.rounds[roundId];
			if(round){
				round.status = ROUND_STATUS.FINISH;
				round.remainsSec = 0;
			}
		},

		/**
		* 現在実行中のラウンドを取得する
		* @return {Object} 実行中のラウンド。なければnull。
		*/
		getRunningRound(){
			var self = this;
			var runningRounds = Object.keys(this.state.rounds).map(function(key){
				return self.state.rounds[key];
			}).filter(function(round){
				return round.status === ROUND_STATUS.RUNNING;
			});

			if(runningRounds.length === 1){
				return this.state.rounds[runningRounds[0].roundId];
			}else{
				return null;
			}
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
				var roundInfo = message.payload;
				var roundId = idGenerator();
				roundInfo.roundId	= roundId;
				store.addRound(roundInfo);

				publisher.gameInfo(roundInfo);

				// TODO:カウントダウン処理めんどいので後で実装。。。
				store.setRoundRunning(roundId);
				publisher.gameStart(roundId);
			},
			/**
			* GAME_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameFinish:function(message){
				var runningRound = store.getRunningRound();
				if(runningRound){
					store.setRoundFinish(runningRound.roundId);
					publisher.gameFinish(runningRound.roundId);
				}
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
