
class ratingReviewParse:
    def __init__(self, id, locateId):
        self.id = id
        self.location = locateId
        self.mobility = 0.0
        self.accessibility = 0.0
        self.vision = 0.0
        self.sensory = 0.0
        self.language = 0.0
        self.reviewContent = ""
        self.qualityReview = 0.0
        self.overallScore = 0.0
        
        
    def setMobility(self, value):
        self.mobility = float(value)
    
    def setAccessibillity(self, value):
        self.accessibility = float(value)
        
    def setVision(self, value):
        self.vision = float(value)
    
    def setSensory(self, value):
        self.sensory = float(value)
    
    def setLang(self, value):
        self.language = float(value)
        
    def setContent(self, value):
        try:
            float(value)  # Try to convert to a float
        except ValueError:
            self.reviewContent = str(value)
    
    def calcOverall(self):
        sum = self.mobility + self.accessibility + self.language + self.sensory + self.vision
        self.overallScore = sum / 5.0
    
    def setQuality(self, value):
        self.qualityReview = float(value)
        




            
