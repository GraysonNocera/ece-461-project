#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BUF_SIZE 2048

int main(int argc, char* argv[]) {
  if (argc < 2) {
    fprintf(stderr, "Error: No mode specified.\n");
    return 1;
  }

  char* mode = argv[1];
  if (strcmp(mode, "install") == 0) {
    // MODE 1: INSTALL DEPENDENCIES
    // TODO: Add code to install dependencies

  } else if (strcmp(mode, "test") == 0) {
    // MODE 3: RUN TESTS
    // TODO: Add code to run tests

  } else {
    // MODE 2: RANK MODULES
    if (argc < 2) {
      fprintf(stderr, "Error: No file path provided.\n");
      return 1;
    }

    char* file_path = argv[2];
    FILE* file = fopen(file_path, "r");
    if (!file) {
      fprintf(stderr, "Error: File not found at path: %s\n", file_path);
      return 1;
    }

    char buf[BUF_SIZE];
    char command[BUF_SIZE + 1024];
    while (fgets(buf, BUF_SIZE, file)) {
      // remove newline character from the end of the line
      buf[strcspn(buf, "\n")] = '\0';

      // create the command string
      sprintf(command, "main.js %s", buf);

      // call main with each URL as argument
      system(command);
    }

    fclose(file);
  }

  return 0;
}
