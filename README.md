# ExperienceLog 
A simple day planner. This implementation focuses on the core concept of organizing activities for a single day with both manual and AI-assisted scheduling.

## Original Concept: ExperienceLog

concept ExperienceLog[User, Place]

purpose capture a user's personal experience at a place with structured ratings and notes

principle each log entry represents one user's assessment of one place at a specific time; users can track and reference their personal experiences

state

a set of Logs with
    a logId LogId
    a userId User
    a placeId Place
    a timestamp DateTime
    a rating Integer
    sweetness Integer
    strength Integer
    notes optional String
    photo optional String (URL)
actions

create_log(userId: User, placeId: Place, rating: Integer): LogId
    **requires** rating is in the inclusive range [1,5]
    **effects** adds new Log with new logId, given params, timestamp = now() to the set of Logs

update_log(logId: LogId, rating?: Integer, sweetness?: Integer, strength?: Integer, notes?: String, photo?: String)
    **requires** logId in {log.logId | log in the set of Logs} and if rating given then rating is in the inclusive range [1,5]
    **effects** update log where log.logId = logId with non-null parameters

get_user_logs(userId: User): set Log
    **effects** return {log | log in the set of Logs and log.userId = userId}

get_place_logs(userId: User, placeId: Place): set Log
    **effects** return {log | log in the set of Logs and log.userId = userId and log.placeId = placeId}

delete_log(logId: LogId)
    **requires** logId in {log.logId | log in the set of Logs}
    **effects** updates the set of Logs such that: logs' = logs - {log | log.logId = logId}

get_average_rating(userId: User, placeId: Place): Float
    **effects** return average of {log.rating | log in the set of Logs and log.userId = userId and log.placeId = placeId}


## AI-Augmented Concept: ExperienceLog

concept ExperienceLog[User, Place]

purpose
    capture a user's personal experience at a place with structured ratings and notes,
    and enable AI-powered insights about their overall preferences and trends

principle
    each log entry represents one user's assessment of one place at a specific time;
    users can track and reference their personal experiences;
    an AI model can generate summaries across a user's logs to highlight patterns
    such as preferred sweetness, strength, or favorite places

state

    a set of Logs with
        a logId LogId
        a userId User
        a placeId Place
        a timestamp DateTime
        a rating Integer
        sweetness Integer
        strength Integer
        notes optional String
        photo optional String (URL)

actions

    create_log(userId: User, placeId: Place, rating: Integer): LogId
        **requires** rating is in the inclusive range [1,5]
        **effects** adds new Log with new logId, given params, timestamp = now() to the set of Logs

    update_log(logId: LogId, rating?: Integer, sweetness?: Integer, strength?: Integer, notes?: String, photo?: String)
        **requires** logId in {log.logId | log in the set of Logs} and if rating given then rating is in the inclusive range [1,5]
        **effects** update log where log.logId = logId with non-null parameters

    get_user_logs(userId: User): set Log
        **effects** return {log | log in the set of Logs and log.userId = userId}

    get_place_logs(userId: User, placeId: Place): set Log
        **effects** return {log | log in the set of Logs and log.userId = userId and log.placeId = placeId}

    delete_log(logId: LogId)
        **requires** logId in {log.logId | log in the set of Logs}
        **effects** updates the set of Logs such that: logs' = logs - {log | log.logId = logId}

    get_average_rating(userId: User, placeId: Place): Float
        **effects** return average of {log.rating | log in the set of Logs and log.userId = userId and log.placeId = placeId}

    async generate_profile_summary(userId: User, llm: GeminiLLM): String
        **requires** there exists at least one log in the set of Logs with log.userId = userId
        **effects** calls llm with the user's Logs (ratings, sweetness, strength, notes, and places)
                    and returns a concise textual summary describing the user's preferences and patterns
        **validators (see later part for explanation)**
            - summary must not mention places not in user's logs
            - summary must be <= 3 sentences
            - sentiment of summary should align with overall average rating

notes
    This augmented version of ExperienceLog integrates an AI model (GeminiLLM)
    to synthesize multiple logs into a readable "taste profile."
    The summary helps users recognize long-term trends and preferences
    that might be difficult to notice from individual entries alone.

    Any parameters marked with a ? at the end are optional.

## User Journey

### Sketches of User Interactions

See [user interaction sketch](./user%20interaction.jpeg)

### Brief User Journey

The user will be able to log a visit to a matcha place with their rating, sweetness level, notes, photo, etc. (not all components that would be included are necessarily shown on the sketch -- just some). When they visit their log collection, they are able to generate a summary of their taste profile from the AI. They can choose to edit the output or regenerate the summary if desired.

## Test Cases

TBD...

The application includes three comprehensive test cases:

### 1. 


### 2. 


### 3. 


## Issues & Validators

To ensure the AI augmentation produces accurate and trustworthy summaries, I implemented three validators. The hallucinated place validator checks that the profile summary only mentions locations that appear in the user's actual logs, preventing the model from fabricating new places. The sentiment consistency validator compares the average numeric rating with the tone of the generated summary to catch cases where the LLM expresses enthusiasm despite low ratings. Finally, the length and format validator enforces brevity by requiring the summary to be no longer than three sentences. Together, these validators help maintain factual grounding, emotional accuracy, and readability in the generated summaries.







## Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
