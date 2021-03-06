/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: true,
	state 	: {
		screenInfo: {
			roundCtlChannel: location.search.substring(1),
			wordsString: '',
			roundInfo: {
				limitSec		: 60,
				roundId			: '',
				aggregateCount	: 15,
				roundName		: '',
				words			: []
			}
		},
		roundInfo	: false
	},

	debugConsole()
	{
		if(this.debug){
			console.dir(this.state);
		}
	},
	roundStart( words )
	{
		this.state.screenInfo.roundInfo.words = words;
	},

	/**
	 * ラウンド操作用のチャンネル情報を返す
	 */
	getRoundCtlChannel() {
		return this.state.screenInfo.roundCtlChannel;
	},
	/**
	 * ラウンド情報のgetter
	 */
	getRunnningRound() {
		return this.state.roundInfo;
	},
	/**
	 * ラウンド情報の読み込み
	 * @param {int} index
	 */
	loadRoundInfo(index) {
		if (index < ROUND_DATA.length) {
			this.state.screenInfo.roundInfo = ROUND_DATA[index];
			this.state.screenInfo.wordsString = JSON.stringify(ROUND_DATA[index].words);
		}
	}
};


/**
 * PUBNUBインスタンスの初期化とsubscribe設定
 */
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
					payload	: store.state.screenInfo.roundInfo
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
			function () {
				const roundInfo = store.getRunnningRound();
				const sendData = {
					type	: ROUND_FINISH,
					payload: {
						roundId : roundInfo.roundId
					}
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: 'ラウンド終了メッセージを送信しました。',
					type	: 'success'
				});
			},
		openRanking:
			function () {
				const sendData = {
					type	: RANKING_OPEN,
					payload: {}
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: '個人戦候補者表示メッセージを送信しました。',
					type	: 'success'
				});
			},
		closeRanking:
			function () {
				const sendData = {
					type	: RANKING_CLOSE,
					payload: {}
				};
				pubnub.publish({
					channel: store.getRoundCtlChannel(),
					message: JSON.stringify( sendData )
				});

				this.$notify({
					title	: 'Success',
					message	: '個人戦候補者非表示メッセージを送信しました。',
					type	: 'success'
				});
			},
		loadRound:
			function (index) {
				store.loadRoundInfo(index);
			}
	}
});