from youtube_transcript_api import YouTubeTranscriptApi
video_id = "XPeeCyJReZw"
transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
transcript = transcript_list.find_generated_transcript(['en'])
translated_transcript = transcript.translate('bg')
print(translated_transcript.fetch())
