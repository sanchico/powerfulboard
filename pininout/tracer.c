/* ========================================
  * Copyright Ansync Inc., 2012
  * ========================================
*/
#include "tracer.h"

/** tracing buffer */
#define BUFSIZE 200
void trace(uint8 value);
uint8 tracebuf[BUFSIZE];
uint8 volatile bufindex = 0;

void antrace(uint8 value)
{
if (bufindex < BUFSIZE){
tracebuf[bufindex] = value;
bufindex++;
}
if (bufindex >= BUFSIZE) bufindex = 0;
return;
}

/* [] END OF FILE */
