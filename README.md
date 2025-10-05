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

### 1. Contradictory Ratings

Scenario: A user logs six experiences - 
1. ZenTeaHouse — rating 5, notes "perfect balance"

2. MatchaLab — rating 2, notes "too bitter"

3. GreenCorner — rating 1, notes “watery texture”

4. GreenCorner — rating 4, notes "improved blend"

5. ZenTeaHouse — rating 5, notes "creamy froth"

6. MatchaLab — rating 3, notes "strong flavor but rough aftertaste"

The user then requests an AI-generated taste profile summary through generate_profile_summary(user1, GeminiLLM).

Prompt Variants

Base prompt (related to this test):
"Summarize this user's matcha preferences based on their logs."

Variant 1:
"Summarize this user's matcha preferences. If a place has both high and low ratings, describe it as a mixed experience rather than consistent."

Variant 2:
"Identify patterns across experiences without oversimplifying inconsistent ratings. Mention variation explicitly if it exists."

Experiment Summary

The base prompt often overgeneralized ("You consistently enjoy GreenCorner") despite conflicting data. Variant 1 introduced explicit instructions to call out variation, which made summaries more accurate and nuanced. Variant 2 further improved tone balance and factual precision, producing responses like "You've had mixed impressions of GreenCorner but consistently enjoy ZenTeaHouse." The main remaining issue is subtle tone exaggeration when positive logs outnumber negative ones.


### 2. Hallucinated Places

Scenario: A user logs only two experiences - 
1. ZenTeaHouse — rating 4, notes "pleasant and smooth"

2. MatchaLab — rating 5, notes "bold flavor, strong aroma"

After requesting an AI-generated profile summary, the LLM sometimes invents references to a new cafe ("You also enjoyed Matcha Corner").

Prompt Variants

Base prompt:
"Generate a short summary of this user's matcha preferences."

Variant 1:
"Generate a short summary of this user's matcha preferences. Mention only places that appear in the data below: ZenTeaHouse, MatchaLab."

Variant 2:
"Summarize this user's preferences. You must not invent new cafes or flavors — reference only the given list of places."

Experiment Summary

The base prompt occasionally hallucinated nonexistent places, especially when logs were few. Variant 1, by listing valid cafes explicitly, eliminated most hallucinations. Variant 2 reinforced this constraint with stronger wording and worked perfectly in all tests. The remaining limitation is that the model sometimes omits place names entirely to avoid error — a tradeoff between completeness and safety.


### 3. Sentiment Mismatch

Scenario: A user logs four experiences, all rated 1-2 but with mildly positive notes:

1. MatchaLab — rating 2, notes "nice atmosphere but too bitter"

2. ZenTeaHouse — rating 1, notes "great service, poor taste"

3. GreenCorner — rating 2, notes "fun vibe but disappointing flavor"

4. ZenTeaHouse — rating 2, notes "friendly barista, bland tea"

When generating the summary, the LLM produces: "You clearly love matcha and enjoy your visits," despite consistently low ratings.

Prompt Variants

Base prompt:
"Generate a 2–3 sentence summary describing this user's matcha preferences."

Variant 1:
"Base sentiment on the average rating. Low ratings should result in neutral or critical tone."

Variant 2:
"Generate a 2–3 sentence profile grounded in numeric data. Avoid positive sentiment when the average rating is below 3."

Experiment Summary

The base prompt ignored numeric cues and produced overly positive text. Variant 1 anchored sentiment to the average rating, improving tone realism. Variant 2, which explicitly tied tone generation to numeric values, produced summaries that correctly described dissatisfaction ("You often appreciate the setting but find the drinks below your taste preference"). The issue that remains is that the model sometimes softens negativity with polite phrasing, which is stylistically appropriate but slightly inconsistent with low ratings.


## Issues & Validators

To ensure the AI augmentation produces accurate and trustworthy summaries, I implemented three validators. The hallucinated place validator checks that the profile summary only mentions locations that appear in the user's actual logs, preventing the model from fabricating new places. The sentiment consistency validator compares the average numeric rating with the tone of the generated summary to catch cases where the LLM expresses enthusiasm despite low ratings. Finally, the length and format validator enforces brevity by requiring the summary to be no longer than three sentences. Together, these validators help maintain factual grounding, emotional accuracy, and readability in the generated summaries.







## Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
