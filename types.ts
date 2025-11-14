
export interface HarmCategory {
  id: string;
  name: string;
  description: string;
}

export interface TestCase {
  id: string;
  category: string;
  title: string;
  steps: string;
  expectedResult: string;
}

export interface RawTestCase {
  category: string;
  title: string;
  steps: string;
  expectedResult: string;
}
