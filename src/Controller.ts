import * as request from 'request';

export default class Controller {

    public totalNbVideo: number;
    public videoIdList: Array<string> = [];
    public nextPageToken: string = "init";
    public access_token: string;

    constructor(access_token: string) {
        this.access_token = access_token;
    }

    getChunkVideoListFromChannelId(channelId: string) {
        return new Promise<any>((resolve, reject) => {
            var url = 'https://www.googleapis.com/youtube/v3/search';
            var payload = {
                channelId: channelId,
                part: 'snippet',
                maxResults: 50,
                pageToken: this.nextPageToken === "init" ? "" : this.nextPageToken
            };
            request.get(url, { qs: payload, headers: { Authorization: this.access_token} }, (error, response, body) => {
                JSON.parse(body).items.forEach(video => {
                    this.videoIdList.push(video.id.videoId);
                });
                this.nextPageToken = JSON.parse(body).nextPageToken;
                resolve(body);
            });
        });
    }

    getAllVideoListFromChannelId(channelId: string) : Promise<string> {
        return new Promise<any>((resolve, reject) => {
            var p = Promise.resolve(); // Q() in q
            for (let i = 0; i < this.totalNbVideo/50+1; i++) {
                p = p.then(() => this.getChunkVideoListFromChannelId(channelId)).catch(e => console.log(e))
            }
            resolve(p);
        });
    }

    getVideoListFromChannelId(channelId: string) {
        return new Promise<any>((resolve, reject) => {
            this.getAllVideoListFromChannelId(channelId)
            .then(res => {
                this.videoIdList = this.videoIdList.filter(element => element !== undefined)
                resolve(this.removeDuplicateUsingFilter(this.videoIdList));
            })
            .catch(e => console.log(e))
        });
    }

    getChannelIdFromChannelName(channelName: string) : Promise<string> {
        return new Promise<any>((resolve, reject) => {
            var url = 'https://www.googleapis.com/youtube/v3/channels';
            var payload = {
                forUsername: channelName,
                part: 'snippet,contentDetails,statistics',
            };
            request.get(url, { qs: payload, headers: { Authorization: this.access_token} }, (error, response, body) => {
                if (JSON.parse(body).items) {
                    this.totalNbVideo = JSON.parse(body).items[0].statistics.videoCount;
                }
                else {
                    console.log(body);
                    return console.log("Please verify you access_token");
                }
                resolve(JSON.parse(body).items[0].id);
            });
        });
    }

    getCaptionIdfromVideoId(videoId: string) {
        return new Promise<any>((resolve, reject) => {
            var url = 'https://www.googleapis.com/youtube/v3/captions';
            var payload = {
                part: 'snippet',
                videoId: videoId,
            };
            request.get(url, { qs: payload, headers: { Authorization: this.access_token}}, (error, response, body) => {
                JSON.parse(body).items.find(elem => {
                    if (elem.snippet.language === "fr")
                    resolve(elem.id);
                });
            });
        });
    }

    getCaptionFromCaptionId(captionId: string) : Promise<string> {
        return new Promise<any>((resolve, reject) => {
            var url = 'https://www.googleapis.com/youtube/v3/captions/'+captionId;
            request({uri: url, method: 'GET', headers: {Authorization: this.access_token}}, (error, response, body) => {
                resolve(body);
            });
        });
    }

    removeDuplicateUsingFilter(arr){
        let unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
    }

    getVideoFromChannel(channelName: string, quoteToFind: string, ) : Promise<string> {
        console.log("getVideoFromChannel ! => "+channelName+" and "+quoteToFind);
        this.videoIdList = [];
        return new Promise<any>((resolve, reject) => {
            // resolve({videoUrl: 'https://www.youtube.com/watch?v=RCVT8Vp6Dp0', videoId: 'RCVT8Vp6Dp0'})
            this.getChannelIdFromChannelName(channelName)
            .then(channelId => {
                this.getVideoListFromChannelId(channelId)
                .then(videoList => {
                    videoList.forEach((videoId, index) => {
                        // if (index === videoList.length - 1) {
                        //     resolve({videoUrl: 'https://www.youtube.com/watch?v=oupsi', videoId: 'videoId'})
                        // }
                        this.getCaptionIdfromVideoId(videoId)
                        .then(captionId => {
                            this.getCaptionFromCaptionId(captionId)
                            .then(caption => {
                                if (videoId === "EcaRKNcxyRk") {
                                    console.log(caption)
                                }
                                if (caption.indexOf(quoteToFind) >= 0) {
                                    console.log(videoId);
                                    resolve({videoUrl: 'https://www.youtube.com/watch?v='+videoId, videoId: videoId});
                                }
                            })
                        })
                    })
                })
            })
            .catch(e => console.log(e))
        });
    }

    getVideoFromKeywords(keywords: Array<string>, quoteToFind: string) : Promise<string> {
        console.log("getVideoFromKeywords ! => "+keywords+" and "+quoteToFind);
        return new Promise<any>((resolve, reject) => {
            resolve({videoUrl: 'https://www.youtube.com/watch?v=6Dh-RL__uN4', videoId: '6Dh-RL__uN4'})
        });
    }
}