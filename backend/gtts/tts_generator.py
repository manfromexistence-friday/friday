from gtts import gTTS
import gtts.lang
import os

def list_supported_languages():
    """
    Returns a dictionary of supported languages and their codes from gTTS.
    """
    return gtts.lang.tts_langs()

def generate_test_audio(lang_code, lang_name, text="Hello, this is a test.", output_dir="test_voices"):
    """
    Generates a test MP3 file for a given language code and name.
    """
    try:
        # Ensure output directory exists
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Sanitize filename (remove invalid characters)
        safe_lang_name = ''.join(c for c in lang_name if c.isalnum() or c in ' _-')
        output_file = os.path.join(output_dir, f"test_{lang_code}_{safe_lang_name}.mp3")
        
        # Create TTS object
        tts = gTTS(text=text, lang=lang_code, slow=False)
        tts.save(output_file)
        print(f"Generated: {output_file}")
        
    except Exception as e:
        print(f"Error generating audio for {lang_name} ({lang_code}): {e}")

def test_all_voices():
    """
    Generates a test audio file for every supported language in gTTS.
    """
    languages = list_supported_languages()
    print(f"Total supported languages (voices): {len(languages)}")
    print("Languages available:")
    for code, name in languages.items():
        print(f"{code}: {name}")
    
    # Test each voice
    sample_text = input("Enter a test phrase (default: 'Hello, this is a test.'): ") or "Hello, this is a test."
    print("\nGenerating test audio files for all voices...")
    
    for lang_code, lang_name in languages.items():
        generate_test_audio(lang_code, lang_name, sample_text)

def main():
    try:
        test_all_voices()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Ensure gTTS is installed
    try:
        import gtts
    except ImportError:
        print("gTTS not found. Installing now...")
        os.system("pip install gtts")
        import gtts
    
    main()