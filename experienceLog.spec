<concept_spec>
concept ExperienceLog

purpose
    help users record and reflect on their matcha drinking experiences,
    so they can remember preferences and discover patterns over time

principle
    each time a user tries matcha, they create a log entry with rating,
    sweetness, strength, notes, and optionally a photo;
    logs are stored and can be queried by user or place;
    an LLM can be used to generate a profile summary from multiple logs
    to highlight user preferences and trends

state
    a set of Logs with
        a unique logId String
        a userId String
        a placeId String
        a timestamp Date
        a rating Number
        a sweetness Number
        a strength Number
        optional notes String
        optional photo String (URL or path)

    invariants
        all ratings, sweetness, and strength values are between 1 and 5
        every log has a valid userId and placeId
        logIds are unique

actions
    createLog(userId: String, placeId: String, rating: Number, sweetness: Number, strength: Number, notes?: String, photo?: String): Log
        requires rating, sweetness, strength between 1 and 5
        effect creates a new log entry with a unique id and stores it

    updateLog(logId: String, updates: Partial<Log>): Log
        requires log with logId exists
        effect updates the fields of the log with given values

    deleteLog(logId: String)
        requires log with logId exists
        effect removes the log

    getUserLogs(userId: String): Set<Log>
        effect returns all logs belonging to the given user

    getPlaceLogs(userId: String, placeId: String): Set<Log>
        effect returns all logs for the given user at a particular place

    getAverageRating(userId: String, placeId: String): Number
        effect returns average rating of logs for given user and place

    async generateProfileSummary(userId: String, llm: GeminiLLM): String
        requires at least one log exists for userId
        effect calls LLM with structured log data (ratings, sweetness, strength, notes, places, timestamps)
               returns a concise 2–3 sentence profile summary of the user’s preferences and trends
        validators ensure
            - summary length ≤ 3 sentences
            - only places present in logs are mentioned
            - sentiment is consistent with ratings

notes
    This concept enables users to both record structured tasting data
    and benefit from AI-generated summaries of their preferences.
    It addresses the problem of forgetting nuanced preferences over time
    by producing human-readable insights from many small logs.
</concept_spec>
