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
    that might be difficult to notice from individual entries alone. Any parameters marked with a ? at the end are optional.

## User Journey

### Sketches of User Interactions

See [user interaction sketch](./user%20interaction.jpeg)

### Brief User Journey

The user will be able to log a visit to a matcha place with their rating, sweetness level, notes, photo, etc. (not all components that would be included are necessarily shown on the sketch -- just some). When they visit their log collection, they are able to generate a summary of their taste profile from the AI. They can choose to edit the output or regenerate the summary if desired.

## Test Cases

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

Prompting

const prompt = `
You are an assistant that summarizes a user's matcha tasting history.
Generate a concise profile (2–3 sentences) in the second person.

User ID: ${userId}
Average rating: ${avgRating.toFixed(1)}
Average sweetness: ${avgSweetness.toFixed(1)}
Average strength: ${avgStrength.toFixed(1)}
Places tried: ${places.join(", ")}
Recent logs:
${last3
  .map(
    (l) =>
      `- ${l.placeId}, rating ${l.rating}, sweetness ${l.sweetness}, strength ${l.strength}, notes: "${l.notes ?? ""}"`
  )
  .join("\n")}

Guidelines:
- Highlight consistent preferences (sweetness/strength).
- If ratings for a place are both high and low, describe it as a mixed experience rather than consistent.
- Keep <= 3 sentences.
`;


Experiment Summary

This first experiment tested how well the model could summarize users with contradictory data. The prompt asked for a concise, second-person summary but gave no instructions on how to handle conflicting opinions. As a result, the model often overgeneralized, producing statements like "You consistently enjoy GreenCorner" even when ratings were both low and high. While the tone was fluent and engaging, it lacked factual nuance. This revealed the need for explicit instructions to treat inconsistent feedback as a "mixed experience," leading to the first refinement of the prompt structure.

### 2. Hallucinated Places

Scenario: A user logs only two experiences - 
1. ZenTeaHouse — rating 4, notes "pleasant and smooth"

2. MatchaLab — rating 5, notes "bold flavor, strong aroma"

After requesting an AI-generated profile summary, the LLM sometimes invents references to a new cafe ("You also enjoyed Matcha Corner").

Prompting

const prompt = `
You are an assistant that summarizes a user's matcha tasting history.
Generate a concise profile (2–3 sentences) in the second person.

User ID: ${userId}
Average rating: ${avgRating.toFixed(1)}
Average sweetness: ${avgSweetness.toFixed(1)}
Average strength: ${avgStrength.toFixed(1)}
Places tried: ${places.join(", ")}
Recent logs:
${last3
  .map(
    (l) =>
      `- ${l.placeId}, rating ${l.rating}, sweetness ${l.sweetness}, strength ${l.strength}, notes: "${l.notes ?? ""}"`
  )
  .join("\n")}

Guidelines:
- Mention only places listed above (no new ones).
- If ratings for a place are both high and low, describe it as a mixed experience rather than consistent.
- Highlight consistent preferences (sweetness/strength).
- Keep <= 3 sentences.
`;



Experiment Summary

This test explored another improvement: grounding the model strictly in the input data. The previous experiment revealed occasional hallucinations -- fabricated cafe names appeared when few logs were provided. By adding explicit constraints to "mention only places listed above," the model produced fully factual summaries without inventing information. However, an unintended side effect emerged that, when uncertain, the model sometimes omitted place names entirely to stay safe. This highlighted a tension between factual precision and content completeness, which the next test aimed to balance by adding tone control.


### 3. Sentiment Mismatch

Scenario: A user logs four experiences, all rated 1-2 but with mildly positive notes:

1. MatchaLab — rating 2, notes "nice atmosphere but too bitter"

2. ZenTeaHouse — rating 1, notes "great service, poor taste"

3. GreenCorner — rating 2, notes "fun vibe but disappointing flavor"

4. ZenTeaHouse — rating 2, notes "friendly barista, bland tea"

Prompting

const prompt = `
You are an assistant that summarizes a user's matcha tasting history.
Generate a concise, factual profile (2–3 sentences) in the second person.

User ID: ${userId}
Average rating: ${avgRating.toFixed(1)}
Average sweetness: ${avgSweetness.toFixed(1)}
Average strength: ${avgStrength.toFixed(1)}
Places tried: ${places.join(", ")}
Recent logs:
${last3
  .map(
    (l) =>
      `- ${l.placeId}, rating ${l.rating}, sweetness ${l.sweetness}, strength ${l.strength}, notes: "${l.notes ?? ""}"`
  )
  .join("\n")}

Guidelines:
- Mention only places listed above (no new ones).
- If ratings for a place are both high and low, describe it as a mixed experience rather than consistent.
- Base tone on the average rating:
  - below 3 → critical or neutral tone,
  - around 3 → balanced tone,
  - above 3 → positive tone.
- Highlight consistent preferences (sweetness/strength).
- Avoid exaggeration or assumptions beyond the data.
- Keep <= 3 sentences.
`;


Experiment Summary

The final test addressed sentiment mismatch, where previous prompts produced overly positive summaries even for users with low ratings. This prompt introduced tone control directly tied to the average rating, ensuring sentiment reflected numeric reality. The model's responses became far more data-driven ("You often enjoy the setting but find the matcha below your taste preference") and avoided unwarranted positivity. The only remaining issue was slight softening of criticism, where the model used polite phrasing instead of direct negativity, a stylistic limitation that can be acceptable for user-facing summaries.


## Issues & Validators

To ensure the AI augmentation produces accurate and trustworthy summaries, I implemented three validators (in validators.ts). The hallucinated place validator checks that the profile summary only mentions locations that appear in the user's actual logs, preventing the model from fabricating new places. The sentiment consistency validator compares the average numeric rating with the tone of the generated summary to catch cases where the LLM expresses enthusiasm despite low ratings. Finally, the length and format validator enforces brevity by requiring the summary to be no longer than three sentences. Together, these validators help maintain factual grounding, emotional accuracy, and readability in the generated summaries.



## Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
