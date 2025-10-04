export interface ParsedFlashcard {
  question: string;
  answer: string;
}

export interface ParseResult {
  success: boolean;
  flashcards: ParsedFlashcard[];
  error?: string;
  detectedFormat?: string;
}

export function parseFlashcards(text: string): ParseResult {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      flashcards: [],
      error: 'No text provided',
    };
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      flashcards: [],
      error: 'No valid content found',
    };
  }

  const formats = [
    tryParseQAFormat,
    tryParsePipeFormat,
    tryParseDashFormat,
    tryParseColonFormat,
    tryParseNumberedFormat,
  ];

  for (const formatParser of formats) {
    const result = formatParser(lines);
    if (result.success && result.flashcards.length > 0) {
      return result;
    }
  }

  return {
    success: false,
    flashcards: [],
    error:
      "Couldn't detect any Q/A pairs. Try using formats like:\n" +
      "• Q: Question?\n  A: Answer\n" +
      "• Question | Answer\n" +
      "• Question - Answer\n" +
      "• 1. Question? - Answer",
  };
}

function tryParseQAFormat(lines: string[]): ParseResult {
  const flashcards: ParsedFlashcard[] = [];
  let currentQuestion = '';

  for (const line of lines) {
    const qMatch = line.match(/^Q:?\s*(.+)$/i);
    const aMatch = line.match(/^A:?\s*(.+)$/i);

    if (qMatch) {
      currentQuestion = qMatch[1].trim();
    } else if (aMatch && currentQuestion) {
      flashcards.push({
        question: currentQuestion,
        answer: aMatch[1].trim(),
      });
      currentQuestion = '';
    }
  }

  return {
    success: flashcards.length > 0,
    flashcards,
    detectedFormat: 'Q:/A: format',
  };
}

function tryParsePipeFormat(lines: string[]): ParseResult {
  const flashcards: ParsedFlashcard[] = [];

  for (const line of lines) {
    const parts = line.split('|');
    if (parts.length >= 2) {
      const question = parts[0].trim();
      const answer = parts.slice(1).join('|').trim();

      if (question && answer) {
        flashcards.push({ question, answer });
      }
    }
  }

  return {
    success: flashcards.length > 0,
    flashcards,
    detectedFormat: 'Pipe (|) delimiter',
  };
}

function tryParseDashFormat(lines: string[]): ParseResult {
  const flashcards: ParsedFlashcard[] = [];

  for (const line of lines) {
    const dashMatch = line.match(/^(.+?)\s*-\s*(.+)$/);
    if (dashMatch) {
      const question = dashMatch[1].trim();
      const answer = dashMatch[2].trim();

      if (question && answer && question.length > 2 && answer.length > 0) {
        flashcards.push({ question, answer });
      }
    }
  }

  return {
    success: flashcards.length > 0,
    flashcards,
    detectedFormat: 'Dash (-) delimiter',
  };
}

function tryParseColonFormat(lines: string[]): ParseResult {
  const flashcards: ParsedFlashcard[] = [];

  for (const line of lines) {
    const colonMatch = line.match(/^(.+?):\s*(.+)$/);
    if (colonMatch) {
      const question = colonMatch[1].trim();
      const answer = colonMatch[2].trim();

      if (
        question &&
        answer &&
        question.length > 3 &&
        answer.length > 0 &&
        !question.match(/^(Q|A|Question|Answer)$/i)
      ) {
        flashcards.push({ question, answer });
      }
    }
  }

  return {
    success: flashcards.length > 0,
    flashcards,
    detectedFormat: 'Colon (:) delimiter',
  };
}

function tryParseNumberedFormat(lines: string[]): ParseResult {
  const flashcards: ParsedFlashcard[] = [];

  for (const line of lines) {
    const numberedMatch = line.match(/^\d+[\.)]\s*(.+?)\s*[-:]\s*(.+)$/);
    if (numberedMatch) {
      const question = numberedMatch[1].trim();
      const answer = numberedMatch[2].trim();

      if (question && answer) {
        flashcards.push({ question, answer });
      }
    }
  }

  return {
    success: flashcards.length > 0,
    flashcards,
    detectedFormat: 'Numbered list (1. Q - A)',
  };
}

