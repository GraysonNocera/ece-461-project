#include <iostream>
#include <thread>
#include <chrono>

void runScript() {
  // run the TypeScript cloning script
  std::cout << "Running TypeScript script" << std::endl;
  std::this_thread::sleep_for(std::chrono::seconds(1));
}

int main() {
  int numThreads = 5; // number of threads to run the script simultaneously

  // create and run
  std::vector<std::thread> threads;
  for (int i = 0; i < numThreads; i++) {
    threads.emplace_back(runScript);
  }

  // waiting for all threads to finish
  for (auto &thread : threads) {
    thread.join();
  }

  return 0;
}