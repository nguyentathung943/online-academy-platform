const Methods = require("../routers/Methods")

const getbyCourseID = async(CourseID) =>{
    const chapters = await Methods.viewChapterList(CourseID);
    
    var videolist = [];
    for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const videos = await Methods.viewVideoList(chapter._id);
        
        
        videolist.push({_id : chapter._id,
            videos : videos});

    }
    return videolist;
}
module.exports = {
    getbyCourseID,
};