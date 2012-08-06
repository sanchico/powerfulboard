/* ========================================
 *
 * Copyright Ansync Inc, 2012
 
 * Set pins according to message from host using command byte.
 * Return state of pins to host using command byte.
 * ========================================
*/
#include <device.h>
#include "tracer.h"
#define NUMBERPINS 43

uint8 OUTbuffer[64];
uint8 INbuffer[64];

// function prototypes
void mypinsInit(uint16* mypins);
int processHostOutput(uint8* OUTbuffer, uint16* mypins);

void main()
{
	uint16 mypins[NUMBERPINS];

    uint8 bctens;
    uint8 bcunits;
	uint8 i, rc;
	uint8 my_bc = 0;
	
	mypinsInit(mypins);
	
	//Enable Global Interrupts
	CYGlobalIntEnable;
	   
	USBFS_1_Start(0, USBFS_1_3V_OPERATION); //Activates the component for use with the device and specific voltage mode.
	antrace(0x01);
	while(!USBFS_1_bGetConfiguration());
	//Wait for Device to enumerate
	
	antrace(0x02);
	USBFS_1_IsConfigurationChanged();  // not interested in this change
	USBFS_1_EnableOutEP(1);
    antrace(0x03);
	
	for(;;){
		if(USBFS_1_bGetEPState(1) == USBFS_1_OUT_BUFFER_FULL) {
		    antrace(0x05);
		    my_bc = USBFS_1_GetEPCount(1);  // get the size of requested transfer
			
		    bctens = (uint8)my_bc/10;
		    bcunits = my_bc % 10;
			
			USBFS_1_ReadOutEP(1, OUTbuffer, my_bc);  // read the data and copy into OUTbuffer
			
			rc = processHostOutput(OUTbuffer, mypins);
		  			
			for (i = 0; i < 64; i++) {
				INbuffer[i] = 0;
			}
			
			INbuffer[0] = OUTbuffer[1]; // this is message number
			
			for(i = 1; i < NUMBERPINS + 1; i++) {	
				INbuffer[i] = CyPins_ReadPin(mypins[i - 1]);
			}

		    while((USBFS_1_bGetEPState(2) != USBFS_1_IN_BUFFER_EMPTY));
		
			antrace(0x06);
			USBFS_1_LoadInEP(2, INbuffer, 64);   //FIXME       
         } else {
		    if(USBFS_1_IsConfigurationChanged()) {  // this is set by SetConfiguration and SetInterface
			    USBFS_1_EnableOutEP(1);
				antrace(0x07);
			}
		}	  
    }
} 

int processHostOutput(uint8* OUTbuffer, uint16* mypins) 
{
    uint8 messagenumber, command, pinnumber;
	// first byte is command byte, second byte is message number
	command = OUTbuffer[0];
	messagenumber = OUTbuffer[1];
	
	switch(command) {
	    case 1:
	
	        for(pinnumber = 0; pinnumber < NUMBERPINS; pinnumber++) {
		    if(OUTbuffer[pinnumber + 2]) {
    	    	CyPins_SetPin(mypins[pinnumber]);
//			    antrace(0x81);
		        } else {
		      	     CyPins_ClearPin(mypins[pinnumber]);
//			         antrace(0x82);
		        }
	        }
	        break;
	    case 2:
	     // do nothing
	        break;
	    default:
	     // this is error
	        break;
	}
	
	return messagenumber;
}
 
 
 void mypinsInit(uint16* mypins)
 {
   mypins[0] = Pin0_0;
   mypins[1] = Pin0_1;
   mypins[2] = Pin0_2;
   mypins[3] = Pin0_3;
   mypins[4] = Pin0_4;
   mypins[5] = Pin0_5;
   mypins[6] = Pin0_6;
   mypins[7] = Pin0_7;
   mypins[8] = Pin0_8;
   mypins[9] = Pin0_9;
   mypins[10] = Pin0_10;
   mypins[11] = Pin0_11;
   mypins[12] = Pin0_12;
   mypins[13] = Pin0_13;
   mypins[14] = Pin0_14;
   mypins[15] = Pin0_15;
   mypins[16] = Pin0_16;
   mypins[17] = Pin0_17;
   mypins[18] = Pin0_18;
   mypins[19] = Pin0_19;
   mypins[20] = Pin0_20;
   mypins[21] = Pin0_21;
   mypins[22] = Pin0_22;
   mypins[23] = Pin0_23;
   mypins[24] = Pin0_24;
   mypins[25] = Pin0_25;
   mypins[26] = Pin0_26;
   mypins[27] = Pin0_27;
   mypins[28] = Pin0_28;
   mypins[29] = Pin0_29;
   mypins[30] = Pin0_30;
   mypins[31] = Pin0_31;
   mypins[32] = Pin0_32; //starts non-connected pins
   mypins[33] = Pin0_33; 
   mypins[34] = Pin0_34;
   mypins[35] = Pin0_35;
   mypins[36] = Pin0_36;
   mypins[37] = Pin0_37;
   mypins[38] = Pin0_38;
   mypins[39] = Pin0_39;
   mypins[40] = Pin0_40;
   mypins[41] = Pin0_41;
   mypins[42] = Pin0_42; //p1.2, no pair
   }
 
/* [] END OF FILE */
