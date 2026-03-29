#!/usr/local/bin/perl

# Greg's howlingly stupid hack 8/20/97 (formatting for versions is
# in the text file. It was incremental, and it was late....

##############################################################################
# Random Text                   Version 1.0                                  #
# Copyright 1996 Matt Wright    mattw@worldwidemart.com                      #
# Created 7/13/96               Last Modified 7/13/96                        #
# Scripts Archive at:           http://www.worldwidemart.com/scripts/        #
##############################################################################
# COPYRIGHT NOTICE                                                           #
# Copyright 1996 Matthew M. Wright  All Rights Reserved.                     #
#                                                                            #
# Random Text may be used and modified free of charge by anyone so long as   #
# this copyright notice and the comments above remain intact.  By using this #
# code you agree to indemnify Matthew M. Wright from any liability that      #  
# might arise from it's use.                                                 #  
#                                                                            #
# Selling the code for this program without prior written consent is         #
# expressly forbidden.  In other words, please ask first before you try and  #
# make money off of my program.                                              #
#                                                                            #
# Obtain permission before redistributing this software over the Internet or #
# in any other medium.  In all cases copyright and header must remain intact #
##############################################################################
# Define Variables                                                           #

# This is the file in which all of your random text phrases are stored.      #

$random_file = "deck.txt";

# The delimiter specifies how each phrase is distinguished from another.  For#
# instance, the common fortune file (a Unix program) is delimited by a new   #
# line followed by two % signs on the next line and then a new line.  This is#
# a pretty good format and you can read more about it in the README file.    #

$delimiter = "\n\%\%\n";

# Done             	                                                     #
##############################################################################

# Open the file containing phrases (and edition formatting nonsense), read it.

open(FILE,"$random_file") || &error('open->random_file',$random_file);
@FILE = <FILE>;
close(FILE);

# As the Oblique Strategies say, "Adding On". Join lines into one string.
$phrases = join('',@FILE);

# Now split the large string according to the $delimiter.
@phrases = split(/$delimiter/,$phrases);

# Invoke srand; with a seed of the time and pid.  If you are on a machine
# which doesn't put the pid into $$ (ie. Macintosh, Win NT, etc...), change
# this line to:  srand(time ^ 22/7);

srand(time ^ $$);

# Return a number which corresponds to one of the random phrases.

$phrase = rand(@phrases);

# This is braindead, but it works. Set up the page....

print <<"DOODAH";
Content-type: text/html

<HTML>
<HEAD>
<TITLE>reload page to draw another card</TITLE>
</HEAD>
<BODY TEXT="#FFCC66" BGCOLOR="#000000" LINK="#FFCC00" VLINK="#FFFF00" ALINK="#FFFFFF">
<CENTER>
<TABLE WIDTH=270 BORDER=0 CELLPADDING=10 CELLSPACING=0>
<TR><TD BGCOLOR="FFFFFF" HEIGHT="126" ALIGN=CENTER><FONT COLOR="000000"><FONT FACE="HELVETICA">
DOODAH

# Convert the selected number into the text we want to return and print it!

print $phrases[$phrase];

#Finish the file....

print <<"DOODAH";
</TD></TR></TABLE>
</center>
</BODY>
DOODAH

# All Done!

exit;

# Was there an error?  If so, let's report that sucker so it can get fixed!

sub error {
    ($error,$file) = @_;
    print <<"END_ERROR";
Content-type: text/html

<html>
 <head>
  <title>ERROR: Random File Unopenable</title>
 </head>
 <body bgcolor=#FFFFFF text=#000000>
  <center>
   <h1>ERROR: Random File Unopenable</h1>
  </center>

The random file, as specified in the \$random_file perl variable was 
unopenable.<p>
END_ERROR

    if (-e $random_file) {
        print "The file was found on your system, so make sure that it is\n";
        print "readable by the web server.  This means you will need to\n";
        print "execute the following command:<pre>\n";
        print "    chmod 744 $random_file\n";
        print "</pre>\n";
    }
    else {
        print "The file was not found on your file system.  This means that\n";
        print "it has either not been created or the path you have specified\n";
        print "in \$trrandom_file is incorrect.\n";
    }
    exit;
}
